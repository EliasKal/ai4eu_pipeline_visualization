import orchestrator_pb2
import orchestrator_pb2_grpc
import grpc
import time
import schedule


def update_data():
    try:
        while True:
            # Fetch data sample from databroker
            data_sample = data_stub.get_next(orchestrator_pb2.Empty())

            # Call models to predict next value
            predict_data = prediction_stub.predict(data_sample)
            #print('ok')

            visualize_data = visualization_stub.get_next(predict_data)

    except Exception as e:
        print("Got an exception ", str(e))

    return

# open a gRPC channel for data client
data_channel = grpc.insecure_channel("localhost:8061")
data_stub = orchestrator_pb2_grpc.DatabrokerStub(data_channel)

# open a gRPC channel for prediction server
prediction_channel = grpc.insecure_channel("localhost:8062")
prediction_stub = orchestrator_pb2_grpc.PredictionStub(prediction_channel)

# open a gRPC channel for visualization server
visualization_channel = grpc.insecure_channel("localhost:8063")
visualization_stub = orchestrator_pb2_grpc.VisualizationStub(visualization_channel)

## do an update every 10 seconds
schedule.every(10).seconds.do(update_data)

try:
    while True:
        schedule.run_pending()
        time.sleep(10)

except Exception as e:
    print("Got an exception ", str(e))