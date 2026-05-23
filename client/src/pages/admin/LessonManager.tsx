import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Button,
  Card,
  Empty,
  Row,
  Col,
  Space,
  Flex,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  LeftOutlined,
  RightOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { api } from '../../api/client';
import { API } from '../../api/endpoints';
import type { LessonDto as Lesson } from '../../api/generated';

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
      await api.put(API.lessons.byId(editing.id!), values);
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
    <div style={{ padding: 24 }}>
      <Link to="/admin/languages">
        <Space size={4}>
          <LeftOutlined /> Languages
        </Space>
      </Link>

      <Flex justify="space-between" align="center" style={{ margin: '12px 0 24px' }}>
        <Typography.Title level={2} style={{ margin: 0 }}>Lessons</Typography.Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => { setEditing(null); form.resetFields(); setModalOpen(true); }}
        >
          Add Lesson
        </Button>
      </Flex>

      {lessons.length === 0 ? (
        <Empty description="No lessons yet. Create one to get started." />
      ) : (
        <Row gutter={[12, 12]}>
          {lessons.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map(lesson => (
            <Col xs={24} md={12} lg={8} key={lesson.id}>
              <Card hoverable onClick={() => navigate(`/admin/lessons/${lesson.id}/exercises`)}>
                <Flex align="flex-start" justify="space-between">
                  <div>
                    <Space size={8}>
                      <Typography.Text type="secondary">#{lesson.order}</Typography.Text>
                      <Typography.Text strong>{lesson.title}</Typography.Text>
                    </Space>
                    {lesson.description && (
                      <Typography.Paragraph type="secondary" ellipsis={{ rows: 1 }} style={{ marginBottom: 0 }}>
                        {lesson.description}
                      </Typography.Paragraph>
                    )}
                  </div>
                  <RightOutlined style={{ color: '#d1d5db' }} />
                </Flex>

                <Flex align="center" justify="space-between" style={{ marginTop: 12 }}>
                  <Typography.Text type="secondary">Pass: {lesson.passThreshold}%</Typography.Text>
                  <Space>
                    <Button type="text" icon={<EditOutlined />} onClick={(e) => handleEdit(e, lesson)} />
                    <Button type="text" danger icon={<DeleteOutlined />} onClick={(e) => handleDelete(e, lesson.id!)} />
                  </Space>
                </Flex>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal
        title={editing ? 'Edit Lesson' : 'Add Lesson'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
      >
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
