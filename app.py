import os
from flask import Flask, render_template, session, jsonify

app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "default-secret-key")

@app.route('/')
def index():
    # Initialize scores if they don't exist
    if 'player_x_score' not in session:
        session['player_x_score'] = 0
    if 'player_o_score' not in session:
        session['player_o_score'] = 0
    
    return render_template('index.html',
                         player_x_score=session['player_x_score'],
                         player_o_score=session['player_o_score'])

@app.route('/update_score/<player>')
def update_score(player):
    if player == 'X':
        session['player_x_score'] = session.get('player_x_score', 0) + 1
    elif player == 'O':
        session['player_o_score'] = session.get('player_o_score', 0) + 1
    
    return jsonify({
        'player_x_score': session['player_x_score'],
        'player_o_score': session['player_o_score']
    })

@app.route('/reset_scores')
def reset_scores():
    session['player_x_score'] = 0
    session['player_o_score'] = 0
    return jsonify({
        'player_x_score': 0,
        'player_o_score': 0
    })
