import json
import pickle
import random
import nltk
import os

from nltk.stem import WordNetLemmatizer
from flask import Flask
from flask_cors import CORS
from keras.model import load_model

app = Flask(__name__)
CORS(app)

PREFIX = '/opt/ml/'
ARTIFACTS_PATH = os.path.join(PREFIX, 'model')

class Bot:

  artifacts = {chatbot_model: None, classes: None, 
                  words: None, intents: None}

  @classmethod
  def get_model_artifacts(cls):
    """Get the model object for this instance, loading it if it's not already loaded.
    """
    for name, artifact in cls.artifacts.items():
      if artifact is None:
        try:
          with open(os.path.join(ARTIFACTS_PATH, f"{name}.json", "r")) as file_artifact:
            cls.artifacts[name] = json.load(file_artifact)
        except:
          cls.artifacts[name] = load_model(os.path.join(ARTIFACTS_PATH, "chatbot_model.h5"))
    return tuple(cls.artifacts.values())

  @classmethod
  def clean_up_sentence(cls, sentence):
    # tokenize the pattern - splitting words into array
    sentence_words = nltk.word_tokenize(sentence)
    # stemming every word - reducing to base form
    sentence_words = [lemmatizer.lemmatize(word.lower()) for word in sentence_words]
    return sentence_words

  @classmethod
  def bag_of_words(cls, sentence, words):
    # tokenizing patterns
    sentence_words = clean_up_sentence(sentence)
    # bag of words - vocabulary matrix
    bag = [0]*len(words)
    for s in sentence_words:
      for i,word in enumerate(words):
        if word == s:
          bag[i] = 1
    return(np.array(bag))

  @classmethod
  def predict_class(cls, sentence):
    model, classes, words, intents = cls.get_model_artifacts()
    # filter below  threshold predictions
    p = bag_of_words(sentence, words,show_details=False)
    res = model.predict(np.array([p]))[0]
    ERROR_THRESHOLD = 0.25
    results = [[i,r] for i,r in enumerate(res) if r>ERROR_THRESHOLD]
    # sorting strength probability
    results.sort(key=lambda x: x[1], reverse=True)
    return_list = []
    for r in results:
        return_list.append({"intent": classes[r[0]], "probability": str(r[1])})

    tag = ints[0]['intent']
    list_of_intents = intents['intents']
    for i in list_of_intents:
      if(i["tag"]==tag):
        result = random.choice(i['responses'])
            break
    return result