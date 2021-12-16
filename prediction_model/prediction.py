#imports
import grpc 
from concurrent import futures
import time
import prediction_pb2
import prediction_pb2_grpc
import numpy as np
from sklearn.ensemble import RandomForestRegressor
import pickle

port = 8062



# no2_vector = np.frombuffer(no2_input).reshape(24,191)
# pm10_vector = np.frombuffer(pm10_input).reshape(24,191)
# pm25_vector = np.frombuffer(pm25_input).reshape(24,191)

# #predict per sensor per model
# results = np.empty([24, 3], dtype = float)
# for i in range(no2_vector.shape[0]):
#     results[i,0] = no2_model.predict(np.reshape(no2_vector[i,:],(-1,191)))
#     results[i,1] = pm10_model.predict(np.reshape(pm10_vector[i,:],(-1,191)))
#     results[i,2] = pm25_model.predict(np.reshape(pm25_vector[i,:],(-1,191)))


# results_output = np.ndarray.tobytes(results)


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
        print(np.frombuffer(no2).shape)
        #convert to numpy from byte and reshape
        no2 = np.frombuffer(no2).reshape(24,191)
        pm10 = np.frombuffer(pm10).reshape(24,191)
        pm25 = np.frombuffer(pm25).reshape(24,191)
        #predict per sensor per model
        results = np.empty([24, 3], dtype = float)
        for i in range(no2.shape[0]):
            results[i,0] = self.no2_model.predict(np.reshape(no2[i,:],(-1,191)))
            results[i,1] = self.pm10_model.predict(np.reshape(pm10[i,:],(-1,191)))
            results[i,2] = self.pm25_model.predict(np.reshape(pm25[i,:],(-1,191)))

        #[0] helps with returning the value instead of numpy array
        response.results = np.ndarray.tobytes(results)

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