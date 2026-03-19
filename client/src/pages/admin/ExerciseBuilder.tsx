import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button, Modal, Form, Input, InputNumber, Select, Upload, message, Space, Divider } from 'antd';
import { PlusOutlined, UploadOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { api } from '../../api/client';
import { API } from '../../api/endpoints';
import { ChevronLeft, Pencil, Trash2 } from 'lucide-react';
import type { Exercise } from '../../types/api';

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

const defaultInstructions: Record<number, string> = {
  0: "What does this mean?",
  1: "What did you hear?",
  2: "Type what you hear",
  3: "Match the pairs",
  4: "Select the correct image",
  5: "Tap words to build the sentence",
  6: "Fill in the blank",
  7: "Tap to reveal",
};

function buildContentJson(type: number, values: Record<string, unknown>): string {
  let obj: Record<string, unknown>;
  switch (type) {
    case 0:
      obj = { word: values.mc_word, correctAnswer: values.mc_correct, distractors: [values.mc_d1, values.mc_d2, values.mc_d3] };
      break;
    case 1:
      obj = { correctText: values.ls_correct, distractors: [values.ls_d1, values.ls_d2, values.ls_d3] };
      break;
    case 2:
      obj = { correctText: values.lt_correct };
      break;
    case 3:
      obj = { pairs: values.mp_pairs };
      break;
    case 4:
      obj = { word: values.is_word, correctImageUrl: values.is_correctImage, distractorImages: [values.is_di1, values.is_di2, values.is_di3] };
      break;
    case 5:
      obj = {
        prompt: values.wb_prompt,
        correctOrder: (values.wb_correctOrder as string).split(',').map((s: string) => s.trim()),
        distractorWords: (values.wb_distractors as string).split(',').map((s: string) => s.trim()).filter(Boolean),
      };
      break;
    case 6:
      obj = { sentence: values.fb_sentence, correctAnswer: values.fb_correct, distractors: [values.fb_d1, values.fb_d2, values.fb_d3].filter(Boolean) };
      break;
    case 7:
      obj = { front: values.fc_front, back: values.fc_back };
      break;
    default:
      obj = {};
  }
  if (values.instruction) obj.instruction = values.instruction;
  return JSON.stringify(obj);
}

function parseContentToFields(type: number, json: string): Record<string, unknown> {
  try {
    const data = JSON.parse(json);
    let fields: Record<string, unknown>;
    switch (type) {
      case 0:
        fields = { mc_word: data.word, mc_correct: data.correctAnswer, mc_d1: data.distractors?.[0], mc_d2: data.distractors?.[1], mc_d3: data.distractors?.[2] };
        break;
      case 1:
        fields = { ls_correct: data.correctText, ls_d1: data.distractors?.[0], ls_d2: data.distractors?.[1], ls_d3: data.distractors?.[2] };
        break;
      case 2:
        fields = { lt_correct: data.correctText };
        break;
      case 3:
        fields = { mp_pairs: data.pairs || [{ word: '', translation: '' }, { word: '', translation: '' }, { word: '', translation: '' }] };
        break;
      case 4:
        fields = { is_word: data.word, is_correctImage: data.correctImageUrl, is_di1: data.distractorImages?.[0], is_di2: data.distractorImages?.[1], is_di3: data.distractorImages?.[2] };
        break;
      case 5:
        fields = { wb_prompt: data.prompt, wb_correctOrder: data.correctOrder?.join(', '), wb_distractors: data.distractorWords?.join(', ') };
        break;
      case 6:
        fields = { fb_sentence: data.sentence, fb_correct: data.correctAnswer, fb_d1: data.distractors?.[0], fb_d2: data.distractors?.[1], fb_d3: data.distractors?.[2] };
        break;
      case 7:
        fields = { fc_front: data.front, fc_back: data.back };
        break;
      default:
        fields = {};
    }
    if (data.instruction) fields.instruction = data.instruction;
    return fields;
  } catch {
    return {};
  }
}

function TypeFields({ type, form, onUpload }: { type: number; form: ReturnType<typeof Form.useForm>[0]; onUpload: (url: string) => void }) {
  const audioUrl = Form.useWatch('audioUrl', form);
  const isCorrectImage = Form.useWatch('is_correctImage', form);
  const isDi1 = Form.useWatch('is_di1', form);
  const isDi2 = Form.useWatch('is_di2', form);
  const isDi3 = Form.useWatch('is_di3', form);

  const uploadFile = async (file: File, field: string) => {
    const res = await api.upload(API.files.upload, file);
    form.setFieldsValue({ [field]: res.url });
    onUpload(res.url);
    message.success('Uploaded');
    return false;
  };

  const imageUploadField = (fieldName: string, label: string, currentUrl: string | undefined) => (
    <Form.Item label={label} required>
      <Form.Item name={fieldName} noStyle rules={[{ required: true, message: `Upload ${label}` }]}>
        <input type="hidden" />
      </Form.Item>
      <div className="flex items-center gap-3">
        <Upload accept="image/*" beforeUpload={(f) => { uploadFile(f, fieldName); return false; }} showUploadList={false}>
          <Button icon={<UploadOutlined />}>Upload Image</Button>
        </Upload>
        {currentUrl
          ? <span className="text-green-600 text-sm font-medium">✓ {currentUrl.split('/').pop()}</span>
          : <span className="text-gray-400 text-sm">No file selected</span>
        }
      </div>
    </Form.Item>
  );

  const audioUploadField = (required = true) => (
    <Form.Item
      label="Audio File"
      required={required}
      validateStatus={required && !audioUrl ? undefined : undefined}
    >
      <Form.Item name="audioUrl" noStyle rules={required ? [{ required: true, message: 'Upload audio file' }] : []}>
        <input type="hidden" />
      </Form.Item>
      <div className="flex items-center gap-3">
        <Upload accept="audio/*" beforeUpload={(f) => { uploadFile(f, 'audioUrl'); return false; }} showUploadList={false}>
          <Button icon={<UploadOutlined />}>Upload Audio</Button>
        </Upload>
        {audioUrl
          ? <span className="text-green-600 text-sm font-medium">✓ {audioUrl.split('/').pop()}</span>
          : <span className="text-gray-400 text-sm">No file selected</span>
        }
      </div>
    </Form.Item>
  );

  switch (type) {
    case 0:
      return (
        <>
          <Form.Item name="mc_word" label="Word / Phrase" rules={[{ required: true }]}><Input placeholder="e.g. Hello" /></Form.Item>
          <Form.Item name="mc_correct" label="Correct Answer" rules={[{ required: true }]}><Input placeholder="e.g. Greeting" /></Form.Item>
          <Form.Item name="mc_d1" label="Distractor 1" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="mc_d2" label="Distractor 2" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="mc_d3" label="Distractor 3" rules={[{ required: true }]}><Input /></Form.Item>
        </>
      );
    case 1:
      return (
        <>
          {audioUploadField()}
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
          {audioUploadField()}
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
          <Form.Item name="is_word" label="Word" rules={[{ required: true }]}><Input placeholder="e.g. Dog" /></Form.Item>
          <Divider />
          {imageUploadField('is_correctImage', 'Correct Image', isCorrectImage)}
          {imageUploadField('is_di1', 'Distractor Image 1', isDi1)}
          {imageUploadField('is_di2', 'Distractor Image 2', isDi2)}
          {imageUploadField('is_di3', 'Distractor Image 3', isDi3)}
        </>
      );
    case 5:
      return (
        <>
          <Form.Item name="wb_prompt" label="Prompt (English sentence)" rules={[{ required: true }]}><Input placeholder="e.g. The dog is big" /></Form.Item>
          <Form.Item name="wb_correctOrder" label="Correct Word Order (comma-separated)" rules={[{ required: true }]} extra={<>Separator: <code style={{ userSelect: 'all', cursor: 'copy' }}>,</code></>}>
            <Input placeholder="e.g. The, dog, is, big" />
          </Form.Item>
          <Form.Item name="wb_distractors" label="Distractor Words (comma-separated)" extra={<>Separator: <code style={{ userSelect: 'all', cursor: 'copy' }}>,</code></>}>
            <Input placeholder="e.g. cat, small" />
          </Form.Item>
        </>
      );
    case 6:
      return (
        <>
          <Form.Item name="fb_sentence" label="Sentence (use _____ for blank)" rules={[{ required: true }]}>
            <Input placeholder="e.g. _____ is big" />
          </Form.Item>
          <Form.Item name="fb_correct" label="Correct Answer" rules={[{ required: true }]}><Input placeholder="e.g. Dog" /></Form.Item>
          <Form.Item name="fb_d1" label="Distractor 1" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="fb_d2" label="Distractor 2"><Input /></Form.Item>
          <Form.Item name="fb_d3" label="Distractor 3"><Input /></Form.Item>
        </>
      );
    case 7:
      return (
        <>
          <Form.Item name="fc_front" label="Front (word/phrase)" rules={[{ required: true }]}><Input placeholder="e.g. Hello" /></Form.Item>
          <Form.Item name="fc_back" label="Back (meaning)" rules={[{ required: true }]}><Input placeholder="e.g. Greeting" /></Form.Item>
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

  const sessionUploads = useRef<string[]>([]);
  const originalAudioUrl = useRef<string | null>(null);
  const originalImageUrls = useRef<{ correct: string | null; di1: string | null; di2: string | null; di3: string | null }>({ correct: null, di1: null, di2: null, di3: null });

  const deleteFile = (url: string) => api.delete(API.files.delete(url)).catch(() => {});

  const load = () => api.get<Exercise[]>(API.lessons.exercises(lessonId!)).then(setExercises);
  useEffect(() => { load(); }, [lessonId]);

  const openCreate = () => {
    sessionUploads.current = [];
    originalAudioUrl.current = null;
    originalImageUrls.current = { correct: null, di1: null, di2: null, di3: null };
    setEditing(null);
    setSelectedType(0);
    form.resetFields();
    form.setFieldsValue({ type: 0, order: 0 });
    setModalOpen(true);
  };

  const openEdit = (record: Exercise) => {
    sessionUploads.current = [];
    originalAudioUrl.current = record.audioUrl ?? null;
    originalImageUrls.current = { correct: null, di1: null, di2: null, di3: null };
    if (record.type === 4) {
      try {
        const d = JSON.parse(record.contentJson);
        originalImageUrls.current = {
          correct: d.correctImageUrl ?? null,
          di1: d.distractorImages?.[0] ?? null,
          di2: d.distractorImages?.[1] ?? null,
          di3: d.distractorImages?.[2] ?? null,
        };
      } catch { /* ignore */ }
    }
    setEditing(record);
    setSelectedType(record.type);
    const contentFields = parseContentToFields(record.type, record.contentJson);
    form.resetFields();
    form.setFieldsValue({ type: record.type, order: record.order, audioUrl: record.audioUrl, ...contentFields });
    setModalOpen(true);
  };

  const handleCancel = () => {
    // Delete everything uploaded in this session (original untouched)
    sessionUploads.current.forEach(deleteFile);
    sessionUploads.current = [];
    originalAudioUrl.current = null;
    originalImageUrls.current = { correct: null, di1: null, di2: null, di3: null };
    setModalOpen(false);
    setEditing(null);
    form.resetFields();
  };

  const handleSave = async (values: Record<string, unknown>) => {
    const type = values.type as number;
    const contentJson = buildContentJson(type, values);
    const savedFileUrl = (values.audioUrl as string) || null;
    const payload = { type, contentJson, audioUrl: savedFileUrl, order: (values.order as number) || 0 };

    if (editing) {
      await api.put(API.exercises.byId(editing.id), payload);
    } else {
      await api.post(API.lessons.exercises(lessonId!), payload);
    }

    const savedUrls = new Set<string>(savedFileUrl ? [savedFileUrl] : []);
    if (type === 4) {
      [values.is_correctImage, values.is_di1, values.is_di2, values.is_di3]
        .filter(Boolean)
        .forEach(u => savedUrls.add(u as string));
    }

    // Delete session uploads that weren't saved
    sessionUploads.current.filter(url => !savedUrls.has(url)).forEach(deleteFile);
    // Delete original audio if it was replaced
    if (originalAudioUrl.current && !savedUrls.has(originalAudioUrl.current)) {
      deleteFile(originalAudioUrl.current);
    }
    // Delete original images if they were replaced
    if (type === 4) {
      [originalImageUrls.current.correct, originalImageUrls.current.di1, originalImageUrls.current.di2, originalImageUrls.current.di3]
        .forEach(orig => { if (orig && !savedUrls.has(orig)) deleteFile(orig); });
    }

    sessionUploads.current = [];
    originalAudioUrl.current = null;
    originalImageUrls.current = { correct: null, di1: null, di2: null, di3: null };
    setModalOpen(false);
    setEditing(null);
    form.resetFields();
    load();
  };

  const handleDelete = async (id: string) => {
    await api.delete(API.exercises.byId(id));
    load();
  };

  const handlePreview = () => {
    const values = form.getFieldsValue();
    const type = values.type as number;
    const json = buildContentJson(type, values);
    setPreviewJson(json);
    setPreviewOpen(true);
  };

  const getPreview = (record: Exercise) => {
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
  };

  return (
    <div className="p-6 md:p-10">
      <Link to={`/admin/languages`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3">
        <ChevronLeft className="w-4 h-4" /> Back to Lessons
      </Link>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Exercises</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Add Exercise</Button>
      </div>

      {exercises.length === 0 ? (
        <p className="text-gray-400 py-12 text-center">No exercises yet. Create one to get started.</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {exercises.sort((a, b) => a.order - b.order).map(ex => (
            <div
              key={ex.id}
              className="bg-white rounded-xl border border-gray-200 p-5 group hover:border-gray-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-400 font-medium">#{ex.order}</span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                      {exerciseTypes.find(t => t.value === ex.type)?.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2">{getPreview(ex)}</p>
                </div>
              </div>
              <div className="flex justify-end gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEdit(ex)}
                  className="p-2.5 md:p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                >
                  <Pencil className="w-5 h-5 md:w-4 md:h-4" />
                </button>
                <button
                  onClick={() => handleDelete(ex.id)}
                  className="p-2.5 md:p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-5 h-5 md:w-4 md:h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        title={editing ? 'Edit Exercise' : 'Add Exercise'}
        open={modalOpen}
        onCancel={handleCancel}
        width={640}
        footer={[
          <Button key="preview" onClick={handlePreview}>Preview JSON</Button>,
          <Button key="cancel" onClick={handleCancel}>Cancel</Button>,
          <Button key="save" type="primary" onClick={() => form.submit()}>Save</Button>,
        ]}
      >
        <Form form={form} layout="vertical" onFinish={handleSave} initialValues={{ order: 0, type: 0 }}>
          <Form.Item name="type" label="Exercise Type">
            <Select options={exerciseTypes} onChange={(v) => setSelectedType(v)} />
          </Form.Item>
          <Form.Item name="order" label="Order"><InputNumber min={0} className="w-full" /></Form.Item>
          <Divider>Content</Divider>
          <TypeFields type={selectedType} form={form} onUpload={(url) => { sessionUploads.current.push(url); }} />
          <Divider />
          <Form.Item
            name="instruction"
            label="Custom Instruction"
            extra="Leave empty to use the default instruction text"
          >
            <Input placeholder={defaultInstructions[selectedType]} allowClear />
          </Form.Item>
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
