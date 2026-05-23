import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Modal,
  Form,
  Input,
  Switch,
  Upload,
  message,
  Button,
  Card,
  Tag,
  Avatar,
  Empty,
  Row,
  Col,
  Space,
  Flex,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  UploadOutlined,
  LeftOutlined,
  RightOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { api } from '../../api/client';
import { API } from '../../api/endpoints';
import type { LanguageDto as Language } from '../../api/generated';

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
      await api.put(API.languages.byId(editing.id!), values);
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
    <div style={{ padding: 24 }}>
      <Link to="/admin">
        <Space size={4}>
          <LeftOutlined /> Admin Panel
        </Space>
      </Link>

      <Flex justify="space-between" align="center" style={{ margin: '12px 0 24px' }}>
        <Typography.Title level={2} style={{ margin: 0 }}>Languages</Typography.Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => { setEditing(null); form.resetFields(); setModalOpen(true); }}
        >
          Add Language
        </Button>
      </Flex>

      {languages.length === 0 ? (
        <Empty description="No languages yet. Create one to get started." />
      ) : (
        <Row gutter={[12, 12]}>
          {languages.map(lang => (
            <Col xs={24} md={12} lg={8} key={lang.id}>
              <Card hoverable onClick={() => navigate(`/admin/languages/${lang.id}/lessons`)}>
                <Flex align="center" justify="space-between">
                  <Space size={16}>
                    {lang.imageUrl
                      ? <Avatar src={lang.imageUrl} shape="square" size={64} />
                      : <Avatar shape="square" size={64}>{lang.name?.[0]}</Avatar>
                    }
                    <div>
                      <Typography.Text strong>{lang.name}</Typography.Text>
                      {lang.description && (
                        <Typography.Paragraph type="secondary" ellipsis={{ rows: 2 }} style={{ marginBottom: 0 }}>
                          {lang.description}
                        </Typography.Paragraph>
                      )}
                    </div>
                  </Space>
                  <RightOutlined style={{ color: '#d1d5db' }} />
                </Flex>

                <Flex align="center" justify="space-between" style={{ marginTop: 12 }}>
                  <Space size={6}>
                    <Tag color={lang.isPublished ? 'green' : 'default'}>
                      {lang.isPublished ? 'Published' : 'Draft'}
                    </Tag>
                    {lang.isDemo && <Tag color="orange">Demo</Tag>}
                  </Space>
                  <Space>
                    <Button type="text" icon={<EditOutlined />} onClick={(e) => handleEdit(e, lang)} />
                    <Button type="text" danger icon={<DeleteOutlined />} onClick={(e) => handleDelete(e, lang.id!)} />
                  </Space>
                </Flex>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal
        title={editing ? 'Edit Language' : 'Add Language'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSave} initialValues={{ isPublished: false, isDemo: false }}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="description" label="Description"><Input.TextArea /></Form.Item>
          <Form.Item name="imageUrl" label="Image URL"><Input /></Form.Item>
          <Upload beforeUpload={handleUpload} showUploadList={false}>
            <Button icon={<UploadOutlined />}>Upload Image</Button>
          </Upload>
          <Form.Item name="isPublished" label="Published" valuePropName="checked"><Switch /></Form.Item>
          <Form.Item name="isDemo" label="Demo Course" valuePropName="checked"><Switch /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
