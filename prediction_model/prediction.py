#imports
import grpc 
from concurrent import futures
import time
import prediction_pb2
import prediction_pb2_grpc
import numpy as np
from sklearn.ensemble import RandomForestRegressor
import pickle

port = 8061

def pollutants_prediction(no2_vector, pm10_vector, pm25_vector):

    return (no2_model.predict(no2_vector), pm10_model.predict(pm10_vector), pm25_model.predict(pm25_vector))


class Prediction(prediction_pb2_grpc.PredictionServicer):

    def __init__(self):
        self.no2_model = model = pickle.load(open('./models/no2_model.sav', 'rb'))
        self.pm10_model = model = pickle.load(open('./models/pm10_model.sav', 'rb'))
        self.pm25_model = model = pickle.load(open('./models/pm25_model.sav', 'rb'))

    def predict(self, request, context):
        response = prediction_pb2.Predictions()
        #request next line of data
        no2 = request.no2_data
        pm10 = request.pm10_data
        pm25 = request.pm25_data

        #convert to numpy from byte and reshape
        no2 = np.frombuffer(no2).reshape(1,-1)
        pm10 = np.frombuffer(pm10).reshape(1,-1)
        pm25 = np.frombuffer(pm25).reshape(1,-1)

        response.no2_value = self.no2_model.predict(no2)
        response.pm10_value = self.pm10_model.predict(pm10)
        response.pm25_value = self.pm25_model.predict(pm25)
        print(elf.no2_model.predict(no2))
        return response

#host server
server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
prediction_pb2_grpc.add_PredictionServicer_to_server(Prediction(), server)
print("Starting server. Listening on port : " + str(port))
server.add_insecure_port("[::]:{}".format(port))
server.start()

try:
    while True:
        time.sleep(86400)
except KeyboardInterrupt:
    server.stop(0)