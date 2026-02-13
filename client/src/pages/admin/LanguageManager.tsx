import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Switch, Upload, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { api } from '../../api/client';
import { Link } from 'react-router-dom';

interface Language {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  isPublished: boolean;
}

export default function LanguageManager() {
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

  const handleDelete = async (id: string) => {
    await api.delete(`/api/languages/${id}`);
    load();
  };

  const handleUpload = async (file: File) => {
    const res = await api.upload('/api/files/upload', file);
    form.setFieldsValue({ imageUrl: res.url });
    message.success('Uploaded');
    return false;
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Published', dataIndex: 'isPublished', key: 'isPublished', render: (v: boolean) => v ? 'Yes' : 'No' },
    {
      title: 'Actions', key: 'actions',
      render: (_: unknown, record: Language) => (
        <div className="flex gap-2">
          <Link to={`/admin/languages/${record.id}/lessons`}><Button size="small">Lessons</Button></Link>
          <Button size="small" icon={<EditOutlined />} onClick={() => { setEditing(record); form.setFieldsValue(record); setModalOpen(true); }} />
          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Languages</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); form.resetFields(); setModalOpen(true); }}>
          Add Language
        </Button>
      </div>
      <Table dataSource={languages} columns={columns} rowKey="id" pagination={false} />
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
