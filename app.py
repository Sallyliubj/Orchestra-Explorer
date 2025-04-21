from flask import Flask, render_template, abort

app = Flask(__name__)

# Home route
@app.route('/')
def home():
    return render_template('home.html')

# Learn routes
@app.route('/learn')
def learn_overview():
    return render_template('learn/overview.html')

@app.route('/learn/<family>')
def learn_family(family):
    valid_families = ['strings', 'woodwinds', 'brass', 'percussion']
    if family not in valid_families:
        abort(404)
    return render_template(f'learn/{family}.html')

@app.route('/learn/<family>/<instrument>')
def learn_instrument(family, instrument):
    # Dictionary of valid instruments for each family
    valid_instruments = {
        'strings': ['violin', 'viola', 'cello', 'double-bass'],
        'woodwinds': ['flute', 'clarinet', 'oboe', 'bassoon'],
        'brass': ['trumpet', 'trombone', 'french-horn', 'tuba'],
        'percussion': ['timpani', 'snare-drum', 'cymbals', 'xylophone']
    }
    
    if family not in valid_instruments or instrument not in valid_instruments[family]:
        abort(404)
    
    try:
        return render_template(f'learn/instruments/{family}/{instrument}.html')
    except:
        # If the specific template doesn't exist, show a generic "coming soon" message
        return render_template('learn/instruments/coming_soon.html', 
                            family=family, 
                            instrument=instrument.replace('-', ' ').title())

# Quiz routes
@app.route('/quiz/<int:quiz_id>')
def quiz(quiz_id):
    if quiz_id < 1 or quiz_id > 5:  # Assuming we have 5 quizzes
        abort(404)
    return render_template(f'quiz/quiz_{quiz_id}.html')

if __name__ == '__main__':
    app.run(debug=True) 