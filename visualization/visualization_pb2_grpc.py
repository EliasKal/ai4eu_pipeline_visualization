# Generated by the gRPC Python protocol compiler plugin. DO NOT EDIT!
"""Client and server classes corresponding to protobuf-defined services."""
import grpc

import visualization_pb2 as visualization__pb2


class VisualizationStub(object):
    """Missing associated documentation comment in .proto file."""

    def __init__(self, channel):
        """Constructor.

        Args:
            channel: A grpc.Channel.
        """
        self.get_next = channel.unary_unary(
                '/Visualization/get_next',
                request_serializer=visualization__pb2.Predictions.SerializeToString,
                response_deserializer=visualization__pb2.Empty.FromString,
                )


class VisualizationServicer(object):
    """Missing associated documentation comment in .proto file."""

    def get_next(self, request, context):
        """Missing associated documentation comment in .proto file."""
        context.set_code(grpc.StatusCode.UNIMPLEMENTED)
        context.set_details('Method not implemented!')
        raise NotImplementedError('Method not implemented!')


def add_VisualizationServicer_to_server(servicer, server):
    rpc_method_handlers = {
            'get_next': grpc.unary_unary_rpc_method_handler(
                    servicer.get_next,
                    request_deserializer=visualization__pb2.Predictions.FromString,
                    response_serializer=visualization__pb2.Empty.SerializeToString,
            ),
    }
    generic_handler = grpc.method_handlers_generic_handler(
            'Visualization', rpc_method_handlers)
    server.add_generic_rpc_handlers((generic_handler,))


 # This class is part of an EXPERIMENTAL API.
class Visualization(object):
    """Missing associated documentation comment in .proto file."""

    @staticmethod
    def get_next(request,
            target,
            options=(),
            channel_credentials=None,
            call_credentials=None,
            insecure=False,
            compression=None,
            wait_for_ready=None,
            timeout=None,
            metadata=None):
        return grpc.experimental.unary_unary(request, target, '/Visualization/get_next',
            visualization__pb2.Predictions.SerializeToString,
            visualization__pb2.Empty.FromString,
            options, channel_credentials,
            insecure, call_credentials, compression, wait_for_ready, timeout, metadata)
