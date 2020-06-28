import json
import pickle
import random
import nltk
import os
import numpy as np

from scipy.spatial.distance import cdist
from utils import get_regex_expression, preprocess_data
from keras.models import Sequential
from keras.layers import Dense, Activation, Dropout
from nltk.stem import WordNetLemmatizer
from flask import Flask, request, Response
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

PREFIX = '/opt/ml/'
ARTIFACTS_PATH = os.path.join(PREFIX, 'model')
lemmatizer = WordNetLemmatizer()

class Bot:

  artifacts = {"chatbot_model": None, "classes": None,
                  "words": None, "intents": None}

  @classmethod
  def get_model_artifacts(cls):
    """Get the model object for this instance, loading it if it's not already loaded.
    """
    for name, artifact in cls.artifacts.items():
      if artifact is None:
        if name != "chatbot_model":
          with open(os.path.join(ARTIFACTS_PATH, f"{name}.json"), "r") as file_artifact:
            cls.artifacts[name] = json.load(file_artifact)
        else:
          cls.artifacts["chatbot_model"] = Sequential()
          cls.artifacts["chatbot_model"].add(Dense(128, input_shape=(53,), activation='relu'))
          cls.artifacts["chatbot_model"].add(Dropout(0.5))
          cls.artifacts["chatbot_model"].add(Dense(64, activation='relu'))
          cls.artifacts["chatbot_model"].add(Dropout(0.5))
          cls.artifacts["chatbot_model"].add(Dense(5, activation='softmax'))
          cls.artifacts["chatbot_model"].load_weights("/opt/ml/model/chatbot_model.h5")
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
    sentence_words = cls.clean_up_sentence(sentence)
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
    p = cls.bag_of_words(sentence, words)
    res = model.predict(np.array([p]))[0]
    ERROR_THRESHOLD = 0.25
    results = [[i,r] for i,r in enumerate(res) if r>ERROR_THRESHOLD]
    # sorting strength probability
    results.sort(key=lambda x: x[1], reverse=True)
    return_list = []
    for r in results:
        return_list.append({"intent": classes[r[0]], "probability": str(r[1])})

    tag = return_list[0]['intent']
    list_of_intents = intents['intents']
    for i in list_of_intents:
      if(i["tag"]==tag):
        result = random.choice(i['responses'])
    return result

class Match:
  artifacts = {"fse_model":None, "db_data":None, "bigrams": None}
  regex = get_regex_expression()

  @classmethod
  def get_artifacts(cls):
    for name, artifact in cls.artifacts.items():
      if artifact is None:
        with open(os.path.join(ARTIFACTS_PATH, f"{name}.pickle"), "rb") as file_artifact:
          cls.artifacts[name] = pickle.load(file_artifact)
    return tuple(cls.artifacts.values())

  @classmethod
  def predict_match(cls,msg):
    fse_model, db_data, bigrams = cls.get_artifacts()
    msg = preprocess_data(msg, regex, False, False)
    msg_transform = list(bigrams[msg])
    query_embeddings = fse_model.infer([(msg_transform,0)])
    distances = cdist(query_embeddings, db_data["data_embeddings"], "cosine")[0]
    results = list(enumerate(distances))
    results_ = sorted(results, key=lambda x: x[1], reverse=False)
    title = db_data["db_inv"][results_[0][0]]
    return title

@app.route("/bot-response")
def bot_response():
  s = request.args.get("s")
  print(s)
  try:
    res = Bot.predict_class(s)
    if res == "python_response":
      res = Match.predict_match(s)

    return Response(json.dumps({"response": res}), status=200,
        mimetype="application/json", content_type="application/json")
  except:
    return Response(json.dumps({"response":"Error"}),status=200,
        mimetype="application/json", content_type="application/json")


@app.route("/")
def index():
  return "hola mundo"