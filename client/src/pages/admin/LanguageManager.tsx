import { useEffect, useState } from 'react';
import { Modal, Form, Input, Switch, Upload, message, Button } from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { api } from '../../api/client';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react';

interface Language {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  isPublished: boolean;
}

export default function LanguageManager() {
  const navigate = useNavigate();
  const [languages, setLanguages] = useState<Language[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Language | null>(null);
  const [form] = Form.useForm();

  const load = () => api.get<Language[]>('/api/languages').then(setLanguages);
  useEffect(() => { load(); }, []);

  const handleSave = async (values: { name: string; description: string; imageUrl?: string; isPublished: boolean }) => {
    if (editing) {
      await api.put(`/api/languages/${editing.id}`, values);
    } else {
      await api.post('/api/languages', values);
    }
    setModalOpen(false);
    setEditing(null);
    form.resetFields();
    load();
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await api.delete(`/api/languages/${id}`);
    load();
  };

  const handleEdit = (e: React.MouseEvent, record: Language) => {
    e.stopPropagation();
    setEditing(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const handleUpload = async (file: File) => {
    const res = await api.upload('/api/files/upload', file);
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
            <div
              key={lang.id}
              onClick={() => navigate(`/admin/languages/${lang.id}/lessons`)}
              className="bg-white rounded-xl border border-gray-200 p-5 cursor-pointer hover:border-gray-300 hover:shadow-sm transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {lang.imageUrl ? (
                    <img src={lang.imageUrl} alt={lang.name} className="w-10 h-10 rounded-lg object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg">
                      {lang.name[0]}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-800">{lang.name}</h3>
                    {lang.description && (
                      <p className="text-sm text-gray-500 line-clamp-1">{lang.description}</p>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 shrink-0 mt-0.5" />
              </div>

              <div className="flex items-center justify-between">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${lang.isPublished ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                  {lang.isPublished ? 'Published' : 'Draft'}
                </span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
            </div>
          ))}
        </div>
      )}

      <Modal title={editing ? 'Edit Language' : 'Add Language'} open={modalOpen} onCancel={() => setModalOpen(false)} onOk={() => form.submit()}>
        <Form form={form} layout="vertical" onFinish={handleSave} initialValues={{ isPublished: false }}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="description" label="Description"><Input.TextArea /></Form.Item>
          <Form.Item name="imageUrl" label="Image URL"><Input /></Form.Item>
          <Upload beforeUpload={handleUpload} showUploadList={false}><Button icon={<UploadOutlined />}>Upload Image</Button></Upload>
          <Form.Item name="isPublished" label="Published" valuePropName="checked"><Switch /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
