from flask import Flask, request, jsonify
from transformers import AutoModelForCausalLM, AutoTokenizer

# Initialize Flask app
app = Flask(__name__)

# Load the model and tokenizer
model_name = "microsoft/Phi-3-mini-4k-instruct"
model = AutoModelForCausalLM.from_pretrained(model_name)
tokenizer = AutoTokenizer.from_pretrained(model_name)

@app.route("/predict", methods=["POST"])
def predict():
    # Get input text from the JavaScript frontend
    input_data = request.json
    input_text = input_data.get("input", "")

    if not input_text:
        return jsonify({"error": "No input text provided"}), 400

    # Run inference with the model
    inputs = tokenizer(input_text, return_tensors="pt")
    outputs = model.generate(**inputs)
    decoded_output = tokenizer.decode(outputs[0], skip_special_tokens=True)

    # Return the output back to JavaScript frontend
    return jsonify({"response": decoded_output})

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
