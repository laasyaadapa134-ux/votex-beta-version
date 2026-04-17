from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv('TRANSLATE_API_KEY')
SEP = '||--SEP--||'

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)


@app.route('/')
def index():
    return app.send_static_file('home.html')


@app.route('/translate', methods=['POST'])
def translate():
    if not API_KEY:
        return ('Translation API key not configured on server', 500)
    data = request.get_json(silent=True) or {}
    text = data.get('text')
    target = data.get('target')
    if not text or not target:
        return ('Missing `text` or `target` in request', 400)

    url = 'https://translation.googleapis.com/language/translate/v2'
    params = {'key': API_KEY}
    payload = {
        'q': text,
        'target': target,
        'format': 'text'
    }
    resp = requests.post(url, params=params, json=payload, timeout=15)
    if resp.status_code != 200:
        return (resp.text, resp.status_code)
    body = resp.json()
    try:
        translated = body['data']['translations'][0]['translatedText']
    except Exception:
        return (body, 500)

    return jsonify({'translatedText': translated})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
