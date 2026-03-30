import { useEffect, useState } from 'react';
import { Modal, Form, Input, Switch, Upload, message, Button } from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { api } from '../../api/client';
import { API } from '../../api/endpoints';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import type { Language } from '../../types/api';
import { Card, Badge } from '../../components/ui';

export default function LanguageManager() {
  const navigate = useNavigate();
  const [languages, setLanguages] = useState<Language[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Language | null>(null);
  const [form] = Form.useForm();

  const load = () => api.get<Language[]>(API.languages.list).then(setLanguages);
  useEffect(() => { load(); }, []);

  const handleSave = async (values: { name: string; description: string; imageUrl?: string; isPublished: boolean; isDemo: boolean }) => {
    if (editing) {
      await api.put(API.languages.byId(editing.id), values);
    } else {
      await api.post(API.languages.list, values);
    }
    setModalOpen(false);
    setEditing(null);
    form.resetFields();
    load();
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await api.delete(API.languages.byId(id));
    load();
  };

  const handleEdit = (e: React.MouseEvent, record: Language) => {
    e.stopPropagation();
    setEditing(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const handleUpload = async (file: File) => {
    const res = await api.upload(API.files.upload, file);
    form.setFieldsValue({ imageUrl: res.url });
    message.success('Uploaded');
    return false;
  };

  return (
    <div className="p-6 md:p-10">
      <Link to="/admin" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3">
        <ChevronLeft className="w-4 h-4" /> Admin Panel
      </Link>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Languages</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); form.resetFields(); setModalOpen(true); }}>
          Add Language
        </Button>
      </div>

      {languages.length === 0 ? (
        <p className="text-gray-400 py-12 text-center">No languages yet. Create one to get started.</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {languages.map(lang => (
            <Card
              key={lang.id}
              onClick={() => navigate(`/admin/languages/${lang.id}/lessons`)}
              clickable
            >
              <div className="flex items-center gap-4 mb-3">
                  {lang.imageUrl ? (
                    <img src={lang.imageUrl} alt={lang.name} className="w-16 h-16 shrink-0 rounded-xl object-cover" />
                  ) : (
                    <div className="w-16 h-16 shrink-0 rounded-xl bg-green-100 flex items-center justify-center">
                      <span className="text-2xl">{lang.name[0]}</span>
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-800">{lang.name}</h3>
                    {lang.description && (
                      <p className="text-sm text-gray-500 line-clamp-2">{lang.description}</p>
                    )}
                  </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 shrink-0" />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-1.5">
                  <Badge variant={lang.isPublished ? 'brand' : 'gray'}>
                    {lang.isPublished ? 'Published' : 'Draft'}
                  </Badge>
                  {lang.isDemo && (
                    <Badge variant="warning">Demo</Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => handleEdit(e, lang)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, lang.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal title={editing ? 'Edit Language' : 'Add Language'} open={modalOpen} onCancel={() => setModalOpen(false)} onOk={() => form.submit()}>
        <Form form={form} layout="vertical" onFinish={handleSave} initialValues={{ isPublished: false, isDemo: false }}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="description" label="Description"><Input.TextArea /></Form.Item>
          <Form.Item name="imageUrl" label="Image URL"><Input /></Form.Item>
          <Upload beforeUpload={handleUpload} showUploadList={false}><Button icon={<UploadOutlined />}>Upload Image</Button></Upload>
          <Form.Item name="isPublished" label="Published" valuePropName="checked"><Switch /></Form.Item>
          <Form.Item name="isDemo" label="Demo Course" valuePropName="checked"><Switch /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
