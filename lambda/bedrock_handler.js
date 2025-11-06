// package.json (añade estas deps si usas layers/zip):
//  "@aws-sdk/client-bedrock-agent-runtime", "@aws-sdk/client-apigatewaymanagementapi"

import { BedrockAgentRuntimeClient, InvokeAgentCommand } from "@aws-sdk/client-bedrock-agent-runtime";
import { ApiGatewayManagementApi } from "@aws-sdk/client-apigatewaymanagementapi";

const region = process.env.REGION || process.env.AWS_REGION;
const agentId = process.env.AGENT_ID;
const agentAliasId = "NDFYNKYUAQ"; // Nuevo alias para Titan

export const handler = async (event) => {
  const { requestContext, body } = event;
  const routeKey = requestContext.routeKey;            // "$connect" | "$disconnect" | "sendMessage"
  const connectionId = requestContext.connectionId;
  
  console.log('🚀 Lambda started, routeKey:', routeKey);
  console.log('📦 Body received:', body);
  console.log('🔗 ConnectionId:', connectionId);
  
  const mgmt = new ApiGatewayManagementApi({
    endpoint: `https://${requestContext.domainName}/${requestContext.stage}`,
  });

  try {
    switch (routeKey) {
      case "$connect": {
        console.log('✅ Connect route');
        // Aquí podrías registrar la conexión en DDB si quisieras; para dev no hace falta.
        return { statusCode: 200 };
      }

      case "$disconnect": {
        console.log('❌ Disconnect route');
        // Limpieza si llevas estado en DDB; para dev no hace falta.
        return { statusCode: 200 };
      }

      case "sendMessage": {
        console.log('💬 SendMessage route');
        const payload = JSON.parse(body || "{}");
        console.log('📋 Parsed payload:', payload);
        
        const text = String(payload.message ?? payload.text ?? "").trim();
        console.log('📝 Text to send to Bedrock:', text);
        
        if (!text) {
          console.log('❌ No text provided');
          await mgmt.postToConnection({
            ConnectionId: connectionId,
            Data: JSON.stringify({ type: "error", message: "Missing 'message' or 'text'." }),
          });
          return { statusCode: 400 };
        }

        // Usa el connectionId como sessionId simple, pero limpiando caracteres especiales
        const sessionId = connectionId.replace(/[^0-9a-zA-Z._:-]/g, '');
        console.log('🔑 Using sessionId:', sessionId);

        const bedrock = new BedrockAgentRuntimeClient({ region });
        console.log('🤖 Bedrock client created, calling agent...');
        console.log('🎯 Agent config - ID:', agentId, 'Alias:', agentAliasId, 'Region:', region);

        // Streaming desde el Agent
        const cmd = new InvokeAgentCommand({
          agentId,
          agentAliasId,
          sessionId,
          inputText: text,
          enableTrace: false,
        });

        try {
          console.log('📡 Sending command to Bedrock...');
          const resp = await bedrock.send(cmd);
          console.log('✅ Bedrock response received');

          // Reenviar chunks al cliente
          let chunkCount = 0;
          for await (const evt of resp.completion) {
            console.log('📦 Processing chunk:', chunkCount++);
            if (evt.chunk?.bytes?.length) {
              const chunkText = new TextDecoder().decode(evt.chunk.bytes);
              console.log('📝 Chunk text:', chunkText);
              await mgmt.postToConnection({
                ConnectionId: connectionId,
                Data: JSON.stringify({ type: "chunk", text: chunkText }),
              });
              console.log('✅ Chunk sent to client');
            }
            // Si tu agente devuelve control/acciones, podrías manejarlas aquí.
          }

          console.log('🏁 Sending done message');
          await mgmt.postToConnection({
            ConnectionId: connectionId,
            Data: JSON.stringify({ type: "done" }),
          });

          console.log('✅ SendMessage completed successfully');
          return { statusCode: 200 };
        } catch (err) {
          console.error('❌ Bedrock error:', err);
          await mgmt.postToConnection({
            ConnectionId: connectionId,
            Data: JSON.stringify({ type: "error", message: err.message || "InvokeAgent failed" }),
          });
          return { statusCode: 500, body: "InvokeAgent failed" };
        }
      }

      default:
        console.log('❓ Unknown route:', routeKey);
        // Catch-all si algo cae en $default por error de mapeo
        await mgmt.postToConnection({
          ConnectionId: connectionId,
          Data: JSON.stringify({ type: "error", message: `Unknown route ${routeKey}` }),
        });
        return { statusCode: 200 };
    }
  } catch (e) {
    console.error('💥 Lambda error:', e);
    // Último recurso
    try {
      await mgmt.postToConnection({
        ConnectionId: connectionId,
        Data: JSON.stringify({ type: "error", message: e.message || "Internal error" }),
      });
    } catch {}
    return { statusCode: 500 };
  }
};
