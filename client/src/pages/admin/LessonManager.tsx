import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Table, Button, Modal, Form, Input, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { api } from '../../api/client';

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  order: number;
  passThreshold: number;
}

export default function LessonManager() {
  const { langId } = useParams();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Lesson | null>(null);
  const [form] = Form.useForm();

  const load = () => api.get<Lesson[]>(`/api/languages/${langId}/lessons`).then(setLessons);
  useEffect(() => { load(); }, [langId]);

  const handleSave = async (values: { title: string; description?: string; order: number; passThreshold: number }) => {
    if (editing) {
      await api.put(`/api/lessons/${editing.id}`, values);
    } else {
      await api.post(`/api/languages/${langId}/lessons`, values);
    }
    setModalOpen(false);
    setEditing(null);
    form.resetFields();
    load();
  };

  const handleDelete = async (id: string) => {
    await api.delete(`/api/lessons/${id}`);
    load();
  };

  const columns = [
    { title: 'Order', dataIndex: 'order', key: 'order', width: 80 },
    { title: 'Title', dataIndex: 'title', key: 'title' },
    { title: 'Pass %', dataIndex: 'passThreshold', key: 'passThreshold', width: 80 },
    {
      title: 'Actions', key: 'actions',
      render: (_: unknown, record: Lesson) => (
        <div className="flex gap-2">
          <Link to={`/admin/lessons/${record.id}/exercises`}><Button size="small">Exercises</Button></Link>
          <Button size="small" icon={<EditOutlined />} onClick={() => { setEditing(record); form.setFieldsValue(record); setModalOpen(true); }} />
          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Lessons</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); form.resetFields(); setModalOpen(true); }}>
          Add Lesson
        </Button>
      </div>
      <Table dataSource={lessons} columns={columns} rowKey="id" pagination={false} />
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
