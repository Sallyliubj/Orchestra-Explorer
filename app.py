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

# Define the order of families for cross-family navigation
FAMILY_ORDER = ['strings', 'woodwinds', 'brass', 'percussion']

def get_next_instrument(family, current_instrument):
    if family not in INSTRUMENTS_BY_FAMILY:
        return None, None
    
    instruments = INSTRUMENTS_BY_FAMILY[family]
    try:
        current_index = instruments.index(current_instrument)
        if current_index == len(instruments) - 1:
            # If this is the last instrument in the family
            if family == FAMILY_ORDER[-1]:  # If this is the last family (percussion)
                # Return special values to indicate quiz navigation
                return 'quiz', 'quiz'
            else:
                # Move to the first instrument of the next family
                next_family_index = (FAMILY_ORDER.index(family) + 1) % len(FAMILY_ORDER)
                next_family = FAMILY_ORDER[next_family_index]
                return INSTRUMENTS_BY_FAMILY[next_family][0], next_family
        else:
            # Stay within the same family
            return instruments[current_index + 1], family
    except ValueError:
        return None, None

def get_previous_instrument(family, current_instrument):
    if family not in INSTRUMENTS_BY_FAMILY:
        return None, None
    
    instruments = INSTRUMENTS_BY_FAMILY[family]
    try:
        current_index = instruments.index(current_instrument)
        if current_index == 0:
            # If this is the first instrument in the family, move to the last instrument of the previous family
            prev_family_index = (FAMILY_ORDER.index(family) - 1) % len(FAMILY_ORDER)
            prev_family = FAMILY_ORDER[prev_family_index]
            prev_instruments = INSTRUMENTS_BY_FAMILY[prev_family]
            return prev_instruments[-1], prev_family
        else:
            # Stay within the same family
            return instruments[current_index - 1], family
    except ValueError:
        return None, None

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
    
    # Calculate progress for each family
    family_progress = {}
    family_total = {}
    total_viewed = 0
    total_instruments = 0
    
    for family, instruments in INSTRUMENTS_BY_FAMILY.items():
        viewed_count = 0
        for instrument in instruments:
            if is_instrument_viewed(family, instrument):
                viewed_count += 1
                total_viewed += 1
            total_instruments += 1
        family_progress[family] = viewed_count
        family_total[family] = len(instruments)
    
    # Family descriptions
    family_descriptions = {
        'strings': 'The string family includes instruments that produce sound through vibrating strings.',
        'woodwinds': 'Woodwind instruments create sound by blowing air through a mouthpiece or reed.',
        'brass': 'Brass instruments produce sound through the vibration of the player\'s lips.',
        'percussion': 'Percussion instruments create sound when struck, shaken, or scraped.'
    }
    
    return render_template('learn/overview.html',
                         families=FAMILY_ORDER,
                         family_descriptions=family_descriptions,
                         family_progress=family_progress,
                         family_total=family_total,
                         total_viewed=total_viewed,
                         total_instruments=total_instruments)

@app.route('/learn/<family>')
def learn_family(family):
    valid_families = ['strings', 'woodwinds', 'brass', 'percussion']
    if family not in valid_families:
        abort(404)
    log_interaction(f"Visited {family.title()} Family Page")
    
    # Get viewed status for each instrument
    viewed_status = {}
    viewed_count = 0
    total_instruments = len(INSTRUMENTS_BY_FAMILY[family])
    
    for instrument in INSTRUMENTS_BY_FAMILY[family]:
        is_viewed = is_instrument_viewed(family, instrument)
        viewed_status[instrument] = is_viewed
        if is_viewed:
            viewed_count += 1
    
    return render_template(f'learn/{family}.html', 
                         family=family,
                         viewed_status=viewed_status,
                         viewed_count=viewed_count,
                         total_instruments=total_instruments)

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

    next_instrument, next_family = get_next_instrument(family, instrument)
    prev_instrument, prev_family = get_previous_instrument(family, instrument)

    try:
        return render_template(f'learn/instruments/{family}/{instrument}.html',
                             next_instrument=next_instrument,
                             next_family=next_family,
                             prev_instrument=prev_instrument,
                             prev_family=prev_family)
    except:
        return render_template('learn/instruments/coming_soon.html', 
                             family=family, 
                             instrument=instrument.replace('-', ' ').title())

@app.route('/quiz')
@app.route('/quiz/<int:quiz_id>')
def quiz(quiz_id=None):
    # Check if learning is completed before allowing quiz access
    if not are_all_instruments_viewed():
        return render_template('quiz_locked.html')
    
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

@app.route('/learn/progress')
def learn_progress():
    log_interaction("Visited Learning Progress Page")
    
    # Calculate progress for each family
    family_progress = {}
    family_total = {}
    total_viewed = 0
    total_instruments = 0
    
    for family, instruments in INSTRUMENTS_BY_FAMILY.items():
        viewed_count = 0
        for instrument in instruments:
            if is_instrument_viewed(family, instrument):
                viewed_count += 1
                total_viewed += 1
            total_instruments += 1
        family_progress[family] = viewed_count
        family_total[family] = len(instruments)
    
    # Family descriptions
    family_descriptions = {
        'strings': 'The string family includes instruments that produce sound through vibrating strings.',
        'woodwinds': 'Woodwind instruments create sound by blowing air through a mouthpiece or reed.',
        'brass': 'Brass instruments produce sound through the vibration of the player\'s lips.',
        'percussion': 'Percussion instruments create sound when struck, shaken, or scraped.'
    }
    
    return render_template('learn/progress.html',
                         families=FAMILY_ORDER,
                         family_descriptions=family_descriptions,
                         family_progress=family_progress,
                         family_total=family_total,
                         total_viewed=total_viewed,
                         total_instruments=total_instruments)

if __name__ == '__main__':
    app.run(debug=True)