from flask import Flask, render_template, abort, session
import secrets
from datetime import datetime

app = Flask(__name__)
app.secret_key = secrets.token_hex(16) 

# Dictionary of instruments by family
INSTRUMENTS_BY_FAMILY = {
    'strings': ['violin', 'viola', 'cello', 'bass', 'harp'],
    'woodwinds': ['flute', 'clarinet', 'oboe', 'bassoon'],
    'brass': ['trumpet', 'trombone', 'french_horn', 'tuba'],
    'percussion': ['timpani', 'snare', 'bassdrum', 'xylophone']
}

def get_next_instrument(family, current_instrument):
    if family not in INSTRUMENTS_BY_FAMILY:
        return None
    instruments = INSTRUMENTS_BY_FAMILY[family]
    try:
        current_index = instruments.index(current_instrument)
        next_index = (current_index + 1) % len(instruments)
        return instruments[next_index]
    except ValueError:
        return None

def get_previous_instrument(family, current_instrument):
    if family not in INSTRUMENTS_BY_FAMILY:
        return None
    instruments = INSTRUMENTS_BY_FAMILY[family]
    try:
        current_index = instruments.index(current_instrument)
        prev_index = (current_index - 1) % len(instruments)
        return instruments[prev_index]
    except ValueError:
        return None

@app.route('/')
def home():
    return render_template('home.html')

def log_interaction(action):
    if 'interactions' not in session:
        session['interactions'] = []
    if 'viewed_instruments' not in session:
        session['viewed_instruments'] = {}
    
    session['interactions'].append({
        'action': action,
        'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    })
    session.modified = True

def is_instrument_viewed(family, instrument):
    viewed = session.get('viewed_instruments', {})
    return viewed.get(family, {}).get(instrument, False)

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
    
    # Get viewed status for each instrument
    viewed_status = {}
    for instrument in INSTRUMENTS_BY_FAMILY[family]:
        viewed_status[instrument] = is_instrument_viewed(family, instrument)
    
    return render_template(f'learn/{family}.html', viewed_status=viewed_status)

@app.route('/learn/<family>/<instrument>')
def learn_instrument(family, instrument):
    valid_instruments = INSTRUMENTS_BY_FAMILY
    if family not in valid_instruments or instrument not in valid_instruments[family]:
        abort(404)
    
    # Mark instrument as viewed
    if 'viewed_instruments' not in session:
        session['viewed_instruments'] = {}
    if family not in session['viewed_instruments']:
        session['viewed_instruments'][family] = {}
    session['viewed_instruments'][family][instrument] = True
    session.modified = True
    
    log_interaction(f"Visited {instrument.replace('_', ' ').title()} Page in {family.title()} Family")

    next_instrument = get_next_instrument(family, instrument)
    prev_instrument = get_previous_instrument(family, instrument)

    try:
        return render_template(f'learn/instruments/{family}/{instrument}.html',
                             next_instrument=next_instrument,
                             prev_instrument=prev_instrument)
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