import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Modal, Form, Input, InputNumber, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { api } from '../../api/client';
import { API } from '../../api/endpoints';
import { ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import type { Lesson } from '../../types/api';

export default function LessonManager() {
  const { langId } = useParams();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Lesson | null>(null);
  const [form] = Form.useForm();

  const load = () => api.get<Lesson[]>(API.languages.lessons(langId!)).then(setLessons);
  useEffect(() => { load(); }, [langId]);

  const handleSave = async (values: { title: string; description?: string; order: number; passThreshold: number }) => {
    if (editing) {
      await api.put(API.lessons.byId(editing.id), values);
    } else {
      await api.post(API.languages.lessons(langId!), values);
    }
    setModalOpen(false);
    setEditing(null);
    form.resetFields();
    load();
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await api.delete(API.lessons.byId(id));
    load();
  };

  const handleEdit = (e: React.MouseEvent, record: Lesson) => {
    e.stopPropagation();
    setEditing(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  return (
    <div className="p-6 md:p-10">
      <Link to="/admin/languages" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3">
        <ChevronLeft className="w-4 h-4" /> Languages
      </Link>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Lessons</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); form.resetFields(); setModalOpen(true); }}>
          Add Lesson
        </Button>
      </div>

      {lessons.length === 0 ? (
        <p className="text-gray-400 py-12 text-center">No lessons yet. Create one to get started.</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {lessons.sort((a, b) => a.order - b.order).map(lesson => (
            <div
              key={lesson.id}
              onClick={() => navigate(`/admin/lessons/${lesson.id}/exercises`)}
              className="bg-white rounded-xl border border-gray-200 p-5 cursor-pointer hover:border-gray-300 hover:shadow-sm transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs text-gray-400 font-medium">#{lesson.order}</span>
                    <h3 className="font-semibold text-gray-800 truncate">{lesson.title}</h3>
                  </div>
                  {lesson.description && (
                    <p className="text-sm text-gray-500 line-clamp-1">{lesson.description}</p>
                  )}
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 shrink-0 mt-0.5" />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Pass: {lesson.passThreshold}%</span>
                <div className="flex gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleEdit(e, lesson)}
                    className="p-2.5 md:p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                  >
                    <Pencil className="w-5 h-5 md:w-4 md:h-4" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, lesson.id)}
                    className="p-2.5 md:p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-5 h-5 md:w-4 md:h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal title={editing ? 'Edit Lesson' : 'Add Lesson'} open={modalOpen} onCancel={() => setModalOpen(false)} onOk={() => form.submit()}>
        <Form form={form} layout="vertical" onFinish={handleSave} initialValues={{ order: 0, passThreshold: 80 }}>
          <Form.Item name="title" label="Title" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="description" label="Description"><Input.TextArea /></Form.Item>
          <Form.Item name="order" label="Order"><InputNumber min={0} /></Form.Item>
          <Form.Item name="passThreshold" label="Pass Threshold %"><InputNumber min={0} max={100} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
