import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Table, Button, Modal, Form, Input, InputNumber, Select, Upload, message, Space, Divider } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { api } from '../../api/client';

const exerciseTypes = [
  { value: 0, label: 'Multiple Choice' },
  { value: 1, label: 'Listen & Select' },
  { value: 2, label: 'Listen & Type' },
  { value: 3, label: 'Match Pairs' },
  { value: 4, label: 'Image Select' },
  { value: 5, label: 'Word Bank' },
  { value: 6, label: 'Fill in Blank' },
  { value: 7, label: 'Flashcard' },
];

interface Exercise {
  id: string;
  type: number;
  contentJson: string;
  audioUrl: string | null;
  order: number;
}

function buildContentJson(type: number, values: Record<string, unknown>): string {
  switch (type) {
    case 0:
      return JSON.stringify({
        word: values.mc_word,
        correctAnswer: values.mc_correct,
        distractors: [values.mc_d1, values.mc_d2, values.mc_d3],
      });
    case 1:
      return JSON.stringify({
        correctText: values.ls_correct,
        distractors: [values.ls_d1, values.ls_d2, values.ls_d3],
      });
    case 2:
      return JSON.stringify({ correctText: values.lt_correct });
    case 3:
      return JSON.stringify({ pairs: values.mp_pairs });
    case 4:
      return JSON.stringify({
        word: values.is_word,
        correctImageUrl: values.is_correctImage,
        distractorImages: [values.is_di1, values.is_di2, values.is_di3],
      });
    case 5:
      return JSON.stringify({
        prompt: values.wb_prompt,
        correctOrder: (values.wb_correctOrder as string).split(',').map((s: string) => s.trim()),
        distractorWords: (values.wb_distractors as string).split(',').map((s: string) => s.trim()).filter(Boolean),
      });
    case 6:
      return JSON.stringify({
        sentence: values.fb_sentence,
        correctAnswer: values.fb_correct,
        distractors: [values.fb_d1, values.fb_d2, values.fb_d3].filter(Boolean),
      });
    case 7:
      return JSON.stringify({ front: values.fc_front, back: values.fc_back });
    default:
      return '{}';
  }
}

function parseContentToFields(type: number, json: string): Record<string, unknown> {
  try {
    const data = JSON.parse(json);
    switch (type) {
      case 0:
        return { mc_word: data.word, mc_correct: data.correctAnswer, mc_d1: data.distractors?.[0], mc_d2: data.distractors?.[1], mc_d3: data.distractors?.[2] };
      case 1:
        return { ls_correct: data.correctText, ls_d1: data.distractors?.[0], ls_d2: data.distractors?.[1], ls_d3: data.distractors?.[2] };
      case 2:
        return { lt_correct: data.correctText };
      case 3:
        return { mp_pairs: data.pairs || [{ word: '', translation: '' }, { word: '', translation: '' }, { word: '', translation: '' }] };
      case 4:
        return { is_word: data.word, is_correctImage: data.correctImageUrl, is_di1: data.distractorImages?.[0], is_di2: data.distractorImages?.[1], is_di3: data.distractorImages?.[2] };
      case 5:
        return { wb_prompt: data.prompt, wb_correctOrder: data.correctOrder?.join(', '), wb_distractors: data.distractorWords?.join(', ') };
      case 6:
        return { fb_sentence: data.sentence, fb_correct: data.correctAnswer, fb_d1: data.distractors?.[0], fb_d2: data.distractors?.[1], fb_d3: data.distractors?.[2] };
      case 7:
        return { fc_front: data.front, fc_back: data.back };
      default:
        return {};
    }
  } catch {
    return {};
  }
}

function TypeFields({ type, form }: { type: number; form: ReturnType<typeof Form.useForm>[0] }) {
  const uploadFile = async (file: File, field: string) => {
    const res = await api.upload('/api/files/upload', file);
    form.setFieldsValue({ [field]: res.url });
    message.success('Uploaded');
    return false;
  };

  switch (type) {
    case 0:
      return (
        <>
          <Form.Item name="mc_word" label="Word / Phrase" rules={[{ required: true }]}><Input placeholder="e.g. Gilakas'la" /></Form.Item>
          <Form.Item name="mc_correct" label="Correct Answer" rules={[{ required: true }]}><Input placeholder="e.g. Thank you" /></Form.Item>
          <Form.Item name="mc_d1" label="Distractor 1" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="mc_d2" label="Distractor 2" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="mc_d3" label="Distractor 3" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="audioUrl" label="Audio (optional)"><Input /></Form.Item>
          <Upload beforeUpload={(f) => { uploadFile(f, 'audioUrl'); return false; }} showUploadList={false}><Button icon={<UploadOutlined />}>Upload Audio</Button></Upload>
        </>
      );
    case 1:
      return (
        <>
          <Form.Item name="audioUrl" label="Audio File" rules={[{ required: true, message: 'Upload audio' }]}><Input /></Form.Item>
          <Upload beforeUpload={(f) => { uploadFile(f, 'audioUrl'); return false; }} showUploadList={false}><Button icon={<UploadOutlined />}>Upload Audio</Button></Upload>
          <Divider />
          <Form.Item name="ls_correct" label="Correct Text" rules={[{ required: true }]}><Input placeholder="What the audio says" /></Form.Item>
          <Form.Item name="ls_d1" label="Distractor 1" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="ls_d2" label="Distractor 2" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="ls_d3" label="Distractor 3" rules={[{ required: true }]}><Input /></Form.Item>
        </>
      );
    case 2:
      return (
        <>
          <Form.Item name="audioUrl" label="Audio File" rules={[{ required: true, message: 'Upload audio' }]}><Input /></Form.Item>
          <Upload beforeUpload={(f) => { uploadFile(f, 'audioUrl'); return false; }} showUploadList={false}><Button icon={<UploadOutlined />}>Upload Audio</Button></Upload>
          <Divider />
          <Form.Item name="lt_correct" label="Correct Text" rules={[{ required: true }]}><Input placeholder="Text the student must type" /></Form.Item>
        </>
      );
    case 3:
      return (
        <>
          <p className="text-gray-500 mb-2">Add word/translation pairs (minimum 3)</p>
          <Form.List name="mp_pairs" initialValue={[{ word: '', translation: '' }, { word: '', translation: '' }, { word: '', translation: '' }]}>
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...rest }) => (
                  <Space key={key} align="baseline" className="flex mb-2">
                    <Form.Item {...rest} name={[name, 'word']} rules={[{ required: true, message: 'Word required' }]}>
                      <Input placeholder="Word" />
                    </Form.Item>
                    <Form.Item {...rest} name={[name, 'translation']} rules={[{ required: true, message: 'Translation required' }]}>
                      <Input placeholder="Translation" />
                    </Form.Item>
                    {fields.length > 3 && <MinusCircleOutlined onClick={() => remove(name)} />}
                  </Space>
                ))}
                <Button type="dashed" onClick={() => add({ word: '', translation: '' })} block icon={<PlusOutlined />}>
                  Add Pair
                </Button>
              </>
            )}
          </Form.List>
        </>
      );
    case 4:
      return (
        <>
          <Form.Item name="is_word" label="Word" rules={[{ required: true }]}><Input placeholder="e.g. A'mis" /></Form.Item>
          <Form.Item name="is_correctImage" label="Correct Image URL" rules={[{ required: true }]}><Input /></Form.Item>
          <Upload beforeUpload={(f) => { uploadFile(f, 'is_correctImage'); return false; }} showUploadList={false}><Button icon={<UploadOutlined />}>Upload Correct Image</Button></Upload>
          <Divider />
          <Form.Item name="is_di1" label="Distractor Image 1" rules={[{ required: true }]}><Input /></Form.Item>
          <Upload beforeUpload={(f) => { uploadFile(f, 'is_di1'); return false; }} showUploadList={false}><Button icon={<UploadOutlined />} size="small">Upload</Button></Upload>
          <Form.Item name="is_di2" label="Distractor Image 2" rules={[{ required: true }]}><Input /></Form.Item>
          <Upload beforeUpload={(f) => { uploadFile(f, 'is_di2'); return false; }} showUploadList={false}><Button icon={<UploadOutlined />} size="small">Upload</Button></Upload>
          <Form.Item name="is_di3" label="Distractor Image 3" rules={[{ required: true }]}><Input /></Form.Item>
          <Upload beforeUpload={(f) => { uploadFile(f, 'is_di3'); return false; }} showUploadList={false}><Button icon={<UploadOutlined />} size="small">Upload</Button></Upload>
        </>
      );
    case 5:
      return (
        <>
          <Form.Item name="wb_prompt" label="Prompt (English sentence)" rules={[{ required: true }]}><Input placeholder="e.g. The dog is big" /></Form.Item>
          <Form.Item name="wb_correctOrder" label="Correct Word Order (comma-separated)" rules={[{ required: true }]}>
            <Input placeholder="e.g. A'mis, ek, aw'ina" />
          </Form.Item>
          <Form.Item name="wb_distractors" label="Distractor Words (comma-separated)">
            <Input placeholder="e.g. nage', gukw" />
          </Form.Item>
        </>
      );
    case 6:
      return (
        <>
          <Form.Item name="fb_sentence" label="Sentence (use _____ for blank)" rules={[{ required: true }]}>
            <Input placeholder="e.g. _____ is big" />
          </Form.Item>
          <Form.Item name="fb_correct" label="Correct Answer" rules={[{ required: true }]}><Input placeholder="e.g. A'mis" /></Form.Item>
          <Form.Item name="fb_d1" label="Distractor 1" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="fb_d2" label="Distractor 2"><Input /></Form.Item>
          <Form.Item name="fb_d3" label="Distractor 3"><Input /></Form.Item>
        </>
      );
    case 7:
      return (
        <>
          <Form.Item name="fc_front" label="Front (word/phrase)" rules={[{ required: true }]}><Input placeholder="e.g. Gilakas'la" /></Form.Item>
          <Form.Item name="fc_back" label="Back (meaning)" rules={[{ required: true }]}><Input placeholder="e.g. Thank you" /></Form.Item>
        </>
      );
    default:
      return null;
  }
}

export default function ExerciseBuilder() {
  const { lessonId } = useParams();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Exercise | null>(null);
  const [selectedType, setSelectedType] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewJson, setPreviewJson] = useState('');
  const [form] = Form.useForm();

  const load = () => api.get<Exercise[]>(`/api/lessons/${lessonId}/exercises`).then(setExercises);
  useEffect(() => { load(); }, [lessonId]);

  const openCreate = () => {
    setEditing(null);
    setSelectedType(0);
    form.resetFields();
    form.setFieldsValue({ type: 0, order: 0 });
    setModalOpen(true);
  };

  const openEdit = (record: Exercise) => {
    setEditing(record);
    setSelectedType(record.type);
    const contentFields = parseContentToFields(record.type, record.contentJson);
    form.resetFields();
    form.setFieldsValue({ type: record.type, order: record.order, audioUrl: record.audioUrl, ...contentFields });
    setModalOpen(true);
  };

  const handleSave = async (values: Record<string, unknown>) => {
    const type = values.type as number;
    const contentJson = buildContentJson(type, values);
    const payload = { type, contentJson, audioUrl: (values.audioUrl as string) || null, order: (values.order as number) || 0 };

    if (editing) {
      await api.put(`/api/exercises/${editing.id}`, payload);
    } else {
      await api.post(`/api/lessons/${lessonId}/exercises`, payload);
    }
    setModalOpen(false);
    setEditing(null);
    form.resetFields();
    load();
  };

  const handleDelete = async (id: string) => {
    await api.delete(`/api/exercises/${id}`);
    load();
  };

  const handlePreview = () => {
    const values = form.getFieldsValue();
    const type = values.type as number;
    const json = buildContentJson(type, values);
    setPreviewJson(json);
    setPreviewOpen(true);
  };

  const columns = [
    { title: '#', dataIndex: 'order', key: 'order', width: 60 },
    { title: 'Type', dataIndex: 'type', key: 'type', render: (v: number) => exerciseTypes.find(t => t.value === v)?.label },
    {
      title: 'Preview', key: 'preview', width: 300,
      render: (_: unknown, record: Exercise) => {
        try {
          const d = JSON.parse(record.contentJson);
          switch (record.type) {
            case 0: return `"${d.word}" → ${d.correctAnswer}`;
            case 1: return `Listen → ${d.correctText}`;
            case 2: return `Type: ${d.correctText}`;
            case 3: return `${d.pairs?.length || 0} pairs`;
            case 4: return `"${d.word}" + images`;
            case 5: return `"${d.prompt}"`;
            case 6: return `"${d.sentence}"`;
            case 7: return `"${d.front}" / "${d.back}"`;
            default: return '—';
          }
        } catch { return '—'; }
      },
    },
    {
      title: 'Actions', key: 'actions', width: 120,
      render: (_: unknown, record: Exercise) => (
        <div className="flex gap-2">
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Exercises</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Add Exercise</Button>
      </div>
      <Table dataSource={exercises} columns={columns} rowKey="id" pagination={false} />

      <Modal
        title={editing ? 'Edit Exercise' : 'Add Exercise'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        width={640}
        footer={[
          <Button key="preview" onClick={handlePreview}>Preview JSON</Button>,
          <Button key="cancel" onClick={() => setModalOpen(false)}>Cancel</Button>,
          <Button key="save" type="primary" onClick={() => form.submit()}>Save</Button>,
        ]}
      >
        <Form form={form} layout="vertical" onFinish={handleSave} initialValues={{ order: 0, type: 0 }}>
          <Form.Item name="type" label="Exercise Type">
            <Select options={exerciseTypes} onChange={(v) => setSelectedType(v)} />
          </Form.Item>
          <Form.Item name="order" label="Order"><InputNumber min={0} className="w-full" /></Form.Item>
          <Divider>Content</Divider>
          <TypeFields type={selectedType} form={form} />
        </Form>
      </Modal>

      <Modal title="Content JSON Preview" open={previewOpen} onCancel={() => setPreviewOpen(false)} footer={null} width={500}>
        <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto max-h-80 whitespace-pre-wrap">
          {(() => { try { return JSON.stringify(JSON.parse(previewJson), null, 2); } catch { return previewJson; } })()}
        </pre>
      </Modal>
    </div>
  );
}
