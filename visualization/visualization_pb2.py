# -*- coding: utf-8 -*-
# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: visualization.proto
"""Generated protocol buffer code."""
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from google.protobuf import reflection as _reflection
from google.protobuf import symbol_database as _symbol_database
# @@protoc_insertion_point(imports)

_sym_db = _symbol_database.Default()




DESCRIPTOR = _descriptor.FileDescriptor(
  name='visualization.proto',
  package='',
  syntax='proto3',
  serialized_options=None,
  create_key=_descriptor._internal_create_key,
  serialized_pb=b'\n\x13visualization.proto\"\x07\n\x05\x45mpty\"\x1e\n\x0bPredictions\x12\x0f\n\x07results\x18\x01 \x01(\x0c\x32\x31\n\rVisualization\x12 \n\x08get_next\x12\x0c.Predictions\x1a\x06.Emptyb\x06proto3'
)




_EMPTY = _descriptor.Descriptor(
  name='Empty',
  full_name='Empty',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  create_key=_descriptor._internal_create_key,
  fields=[
  ],
  extensions=[
  ],
  nested_types=[],
  enum_types=[
  ],
  serialized_options=None,
  is_extendable=False,
  syntax='proto3',
  extension_ranges=[],
  oneofs=[
  ],
  serialized_start=23,
  serialized_end=30,
)


_PREDICTIONS = _descriptor.Descriptor(
  name='Predictions',
  full_name='Predictions',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  create_key=_descriptor._internal_create_key,
  fields=[
    _descriptor.FieldDescriptor(
      name='results', full_name='Predictions.results', index=0,
      number=1, type=12, cpp_type=9, label=1,
      has_default_value=False, default_value=b"",
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR,  create_key=_descriptor._internal_create_key),
  ],
  extensions=[
  ],
  nested_types=[],
  enum_types=[
  ],
  serialized_options=None,
  is_extendable=False,
  syntax='proto3',
  extension_ranges=[],
  oneofs=[
  ],
  serialized_start=32,
  serialized_end=62,
)

DESCRIPTOR.message_types_by_name['Empty'] = _EMPTY
DESCRIPTOR.message_types_by_name['Predictions'] = _PREDICTIONS
_sym_db.RegisterFileDescriptor(DESCRIPTOR)

Empty = _reflection.GeneratedProtocolMessageType('Empty', (_message.Message,), {
  'DESCRIPTOR' : _EMPTY,
  '__module__' : 'visualization_pb2'
  # @@protoc_insertion_point(class_scope:Empty)
  })
_sym_db.RegisterMessage(Empty)

Predictions = _reflection.GeneratedProtocolMessageType('Predictions', (_message.Message,), {
  'DESCRIPTOR' : _PREDICTIONS,
  '__module__' : 'visualization_pb2'
  # @@protoc_insertion_point(class_scope:Predictions)
  })
_sym_db.RegisterMessage(Predictions)



_VISUALIZATION = _descriptor.ServiceDescriptor(
  name='Visualization',
  full_name='Visualization',
  file=DESCRIPTOR,
  index=0,
  serialized_options=None,
  create_key=_descriptor._internal_create_key,
  serialized_start=64,
  serialized_end=113,
  methods=[
  _descriptor.MethodDescriptor(
    name='get_next',
    full_name='Visualization.get_next',
    index=0,
    containing_service=None,
    input_type=_PREDICTIONS,
    output_type=_EMPTY,
    serialized_options=None,
    create_key=_descriptor._internal_create_key,
  ),
])
_sym_db.RegisterServiceDescriptor(_VISUALIZATION)

DESCRIPTOR.services_by_name['Visualization'] = _VISUALIZATION

# @@protoc_insertion_point(module_scope)
