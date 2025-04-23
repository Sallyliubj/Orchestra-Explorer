from flask import Flask, render_template, abort, session
import secrets
from datetime import datetime

app = Flask(__name__)
app.secret_key = secrets.token_hex(16) 

@app.route('/')
def home():
    return render_template('home.html')

def log_interaction(action):
    if 'interactions' not in session:
        session['interactions'] = []
    session['interactions'].append({
        'action': action,
        'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    })
    session.modified = True

@app.route('/learn')
def learn_overview():
    log_interaction("Visited Learn Overview Page")
    return render_template('learn/overview.html')

@app.route('/learn/<family>')
def learn_family(family):
    valid_families = ['strings', 'woodwinds', 'brass', 'percussion']
    if family not in valid_families:
        abort(404)
    log_interaction(f"Visited {family.title()} Family Page")
    return render_template(f'learn/{family}.html')

@app.route('/learn/<family>/<instrument>')
def learn_instrument(family, instrument):
    valid_instruments = {
        'strings': ['violin', 'viola', 'cello', 'bass', 'harp'],
        'woodwinds': ['flute', 'clarinet', 'oboe', 'bassoon'],
        'brass': ['trumpet', 'trombone', 'french_horn', 'tuba'],
        'percussion': ['timpani', 'snare', 'bassdrum', 'xylophone']
    }
    if family not in valid_instruments or instrument not in valid_instruments[family]:
        abort(404)
    log_interaction(f"Visited {instrument.replace('_', ' ').title()} Page in {family.title()} Family")

    try:
        return render_template(f'learn/instruments/{family}/{instrument}.html')
    except:
        return render_template('learn/instruments/coming_soon.html', 
                               family=family, 
                               instrument=instrument.replace('-', ' ').title())

@app.route('/quiz')
def quiz():
    return render_template('quiz.html')

@app.route('/interactions')
def view_interactions():
    interactions = session.get('interactions', [])
    print("Rendering interactions page with:", interactions)
    return render_template('interactions.html', interactions=interactions)

if __name__ == '__main__':
    app.run(debug=True)