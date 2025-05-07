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
    learning_completed = are_all_instruments_viewed()
    quiz_completed = is_quiz_completed()
    return render_template('home.html', 
                         learning_completed=learning_completed,
                         quiz_completed=quiz_completed)

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
@app.route('/quiz/<int:quiz_id>')
def quiz(quiz_id=None):
    if quiz_id is None:
        # Initial quiz page (start)
        return render_template('quiz/start.html')
    
    # Map quiz_id to respective templates
    quiz_templates = {
        1: 'quiz/question_1.html',
        2: 'quiz/question_2.html',
        3: 'quiz/question_3.html',
        4: 'quiz/question_4.html',
        5: 'quiz/question_5.html',
        6: 'quiz/question_6.html',
        7: 'quiz/question_7.html',
        8: 'quiz/certificate.html'
    }
    
    if quiz_id in quiz_templates:
        log_interaction(f"Accessed Quiz Question {quiz_id}")
        return render_template('quiz.html', quiz_template=quiz_templates[quiz_id])
    else:
        abort(404)

@app.route('/interactions')
def view_interactions():
    interactions = session.get('interactions', [])
    print("Rendering interactions page with:", interactions)
    return render_template('interactions.html', interactions=interactions)

def are_all_instruments_viewed():
    if 'viewed_instruments' not in session:
        return False
    
    viewed = session['viewed_instruments']
    for family, instruments in INSTRUMENTS_BY_FAMILY.items():
        if family not in viewed:
            return False
        for instrument in instruments:
            if not viewed[family].get(instrument, False):
                return False
    return True

def is_quiz_completed():
    if 'interactions' not in session:
        return False
    
    # Check if user has accessed the certificate page (quiz_id=8)
    for interaction in session['interactions']:
        if interaction['action'] == "Accessed Quiz Question 8":
            return True
    return False

if __name__ == '__main__':
    app.run(debug=True)