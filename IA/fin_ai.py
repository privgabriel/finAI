import numpy as np
import pandas as pd
from flask import Flask, request, jsonify

app = Flask(__name__)

def analyze_finances(data):
    """Analisa as finanças do usuário e sugere investimentos."""
    total_income = sum([t['valor'] for t in data if t['tipo'].lower() == 'receita'])
    total_expense = sum([t['valor'] for t in data if t['tipo'].lower() == 'despesa'])
    savings = total_income - total_expense

    suggestions = []
    if savings > 1000:
        suggestions.append(f"Você pode investir R$ {savings * 0.3:.2f} em renda fixa.")
    elif savings < 0:
        suggestions.append("Considere reduzir despesas desnecessárias.")

    return {
        "total_income": total_income,
        "total_expense": total_expense,
        "savings": savings,
        "suggestions": suggestions
    }

@app.route('/analyze', methods=['POST'])
def analyze():
    """Endpoint para análise financeira."""
    try:
        data = request.json  # Recebe dados JSON enviados pelo cliente
        if not data or not isinstance(data, list):
            return jsonify({"error": "Formato de dados inválido, deve ser uma lista de transações."}), 400

        result = analyze_finances(data)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
