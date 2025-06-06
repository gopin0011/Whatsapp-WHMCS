from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

# URL endpoint WhatsApp API kamu
WHATSAPP_API_URL = 'http://localhost:8081/send-message'

@app.route('/api/send', methods=['POST'])
def send_whatsapp_message():
    data = request.get_json()

    # Validasi input
    if not data or 'phone' not in data or 'message' not in data:
        return jsonify({'status': 'error', 'message': 'phone and message required'}), 400

    phone = data['phone']
    message = data['message']

    payload = {
        'number': phone,
        'message': message
    }

    try:
        response = requests.post(WHATSAPP_API_URL, json=payload)
        if response.status_code == 200:
            return jsonify({'status': 'success', 'message': 'Message sent'})
        else:
            return jsonify({'status': 'error', 'message': f'Failed to send message: {response.text}'}), 500

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
