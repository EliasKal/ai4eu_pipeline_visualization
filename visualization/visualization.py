#imports
import grpc 
from concurrent import futures
import time
import visualization_pb2
import visualization_pb2_grpc
import csv
import os
from app import app

port = 8063


class Visualization(visualization_pb2_grpc.VisualizationServicer):

    def __init__(self):
        pass
            

    def get_next(self, request, context):
        response = visualization_pb2.Empty()
        data = [request.no2_value, request.pm10_value, request.pm25_value]
        with open("./app/static/data/results.csv",  'a+', encoding='UTF8', newline='') as f:
            writer = csv.writer(f,delimiter = ",")
            writer.writerow(data)
            f.close()
        return response


#create results file if it doesnt exist
if not os.path.exists('./app/static/data/results.csv'):
    header = ['NO2', 'PM10', 'PM2.5']
    with open("./app/static/data/results.csv",  'w+', encoding='UTF8', newline='') as f:
        writer = csv.writer(f, delimiter = ",")
        writer.writerow(header)
        f.close()        

#host server
server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
visualization_pb2_grpc.add_VisualizationServicer_to_server(Visualization(), server)
print("Starting server. Listening on port : " + str(port))
server.add_insecure_port("[::]:{}".format(port))
server.start()
app.run()

try:
    while True:
        time.sleep(86400)
except KeyboardInterrupt:
    server.stop(0)