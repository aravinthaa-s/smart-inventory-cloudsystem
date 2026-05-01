const { BlobServiceClient } = require('@azure/storage-blob');
const { OpenAIClient, AzureKeyCredential } = require('@azure/openai');

// Blob Storage Initialization
const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING || "DefaultEndpointsProtocol=https;AccountName=placeholder;AccountKey=placeholder;EndpointSuffix=core.windows.net");

async function uploadBlob(containerName, blobName, content) {
  try {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    // Create container if it doesn't exist
    await containerClient.createIfNotExists({ access: 'container' });

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.upload(content, content.length);
    return blockBlobClient.url;
  } catch (error) {
    console.error("Error uploading to Blob:", error);
    return null;
  }
}

// Azure OpenAI Initialization
const openaiClient = new OpenAIClient(
  process.env.AZURE_OPENAI_ENDPOINT || "https://placeholder.openai.azure.com/",
  new AzureKeyCredential(process.env.AZURE_OPENAI_KEY || "placeholder")
);
const deploymentId = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-35-turbo";

async function generateAISuggestions(prompt, stockContext) {
  try {
    const messages = [
      { role: "system", content: "You are an AI Inventory Assistant. Provide insights on low stock, demand forecasting, reorder suggestions, and inventory summary. Use the provided context." },
      { role: "user", content: `Context: ${stockContext}\n\nQuery: ${prompt}` }
    ];

    const result = await openaiClient.getChatCompletions(deploymentId, messages);
    return result.choices[0].message.content;
  } catch (error) {
    console.error("Error calling Azure OpenAI:", error);
    return "AI insights are currently unavailable.";
  }
}

module.exports = {
  uploadBlob,
  generateAISuggestions
};
