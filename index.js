// 1. Importing axios for making HTTP requests and dotenv for managing environment variables.
const axios = require("axios");
require("dotenv").config();
// 2. Function to simulate getting current weather.
function get_current_weather(location, unit = "fahrenheit") {
// 3. Logs function call details.
  console.log(
    `Called get_current_weather with location: ${location} and unit: ${unit}`
  );
// 4. Returns simulated weather data.
  return JSON.stringify({
    location: location,
    temperature: "30",
    unit: unit,
    forecast: ["sunny", "windy"],
  });
}
// 5. Function to simulate getting clothing recommendations based on temperature.
function get_clothing_recommendations(temperature) {
// 6. Logs function call details.
  console.log(
    `Called get_clothing_recommendations with temperature: ${temperature}`
  );
// 7. Provides clothing recommendation based on the temperature.
  let recommendation =
    temperature < 60 ? "warm clothing colourful" : "light clothing tye-dye";
// 8. Returns clothing recommendation.
  return JSON.stringify({ recommendation: recommendation });
}
// 9. Main function to handle the conversation with the API.
async function run_conversation() {
// 10. The base URL for OpenAI API.
  const baseURL = "https://api.openai.com/v1/chat/completions";
// 11. Headers for the OpenAI API request.
  const headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer " + process.env.OPENAI_API_KEY,
  };
// 12. Data to send to the API.
  let data = {
    messages: [
      {
        role: "user",
        content:
          "What's the weather like in Boston in fahrenheit and based on the temperature what should I wear?",
      },
    ],
    model: "gpt-3.5-turbo-0613",
    functions: [
      {
        name: "get_current_weather",
        description: "Get the current weather in a given location",
        parameters: {
          type: "object",
          properties: {
            location: {
              type: "string",
              description: "The city and state, e.g. San Francisco, CA",
            },
            unit: { type: "string", enum: ["celsius", "fahrenheit"] },
          },
          required: ["location"],
        },
      },
      {
        name: "get_clothing_recommendations",
        description: "Get clothing recommendation based on temperature",
        parameters: {
          type: "object",
          properties: {
            temperature: {
              type: "string",
              description: "The current temperature",
            },
          },
          required: ["temperature"],
        },
      },
    ],
    function_call: "auto",
  };
// 13. Try block to handle potential errors.
  try {
// 14. Initial API request.
    console.log(`Sending initial request to OpenAI API...`);
    let response = await axios.post(baseURL, data, { headers });
    response = response.data;
// 15. Track Executed Functions to Prevent Unnecessary Invocations
    let executedFunctions = {};
// 16. Loop to process the conversation until it finishes.
    while (
      response.choices[0].message.function_call &&
      response.choices[0].finish_reason !== "stop"
    ) {
      let message = response.choices[0].message;
      const function_name = message.function_call.name;
      // 17. Breaks the loop if function has already been executed.
      if (executedFunctions[function_name]) {
        break;
      }
      // 18. Calls the appropriate function based on the name.
      let function_response = "";
      switch (function_name) {
        case "get_current_weather":
          let weatherArgs = JSON.parse(message.function_call.arguments);
          function_response = get_current_weather(
            weatherArgs.location,
            weatherArgs.unit
          );
          break;
        case "get_clothing_recommendations":
          let recommendationArgs = JSON.parse(message.function_call.arguments);
          function_response = get_clothing_recommendations(
            recommendationArgs.temperature
          );
          break;
        default:
          throw new Error(`Unsupported function: ${function_name}`);
      }
// 19. Adds the function to the executed functions list.
      executedFunctions[function_name] = true;
// 20. Appends the function response to the messages list.
      data.messages.push({
        role: "function",
        name: function_name,
        content: function_response,
      });
// 21. Makes another API request with the updated messages list.
      console.log(`Sending request to OpenAI with ${function_name} response...`);
      response = await axios.post(baseURL, data, { headers });
      response = response.data;
    }
// 22. Makes the final API request after the conversation is finished.
    response = await axios.post(baseURL, data, { headers });
    response = response.data;
// 23. Returns the final response data.
    return response;
  } catch (error) {
// 24. Logs any error encountered during execution.
    console.error("Error:", error);
  }
}
// 25. Running the conversation and processing the response.
run_conversation()
  .then((response) => {
// 26. Logging the final message content.
    console.log(response.choices[0].message.content);
  })
  .catch((error) => {
// 27. Logging any error encountered during execution.
    console.error("Error:", error);
  });
