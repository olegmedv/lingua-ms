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
import { useLanguages } from '../../hooks/useLanguages';
import { useFiles } from '../../hooks/useFiles';
import { useIsDemoUser } from '../../hooks/useIsDemoUser';
import DemoTooltip from '../../components/admin/DemoTooltip';
import type { LanguageDto as Language } from '../../api/generated';

export default function LanguageManager() {
  const navigate = useNavigate();
  const langs = useLanguages();
  const files = useFiles();
  const isDemo = useIsDemoUser();
  const [languages, setLanguages] = useState<Language[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Language | null>(null);
  const [form] = Form.useForm();

  const load = () => langs.list().then(setLanguages);
  useEffect(() => { load(); }, [langs]);

  const handleSave = async (values: { name: string; description: string; imageUrl?: string; isPublished: boolean; isDemo: boolean }) => {
    if (editing) {
      await langs.update(editing.id!, values);
    } else {
      await langs.create(values);
    }
    setModalOpen(false);
    setEditing(null);
    form.resetFields();
    load();
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await langs.remove(id);
    load();
  };

  const handleEdit = (e: React.MouseEvent, record: Language) => {
    e.stopPropagation();
    setEditing(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const handleUpload = async (file: File) => {
    const res = await files.upload(file);
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
        <DemoTooltip>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            disabled={isDemo}
            onClick={() => { setEditing(null); form.resetFields(); setModalOpen(true); }}
          >
            Add Language
          </Button>
        </DemoTooltip>
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
                    <DemoTooltip>
                      <Button type="text" icon={<EditOutlined />} disabled={isDemo} onClick={(e) => handleEdit(e, lang)} />
                    </DemoTooltip>
                    <DemoTooltip>
                      <Button type="text" danger icon={<DeleteOutlined />} disabled={isDemo} onClick={(e) => handleDelete(e, lang.id!)} />
                    </DemoTooltip>
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
        okButtonProps={{ disabled: isDemo }}
      >
        <Form form={form} layout="vertical" onFinish={handleSave} initialValues={{ isPublished: false, isDemo: false }}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="description" label="Description"><Input.TextArea /></Form.Item>
          <Form.Item name="imageUrl" label="Image URL"><Input /></Form.Item>
          <DemoTooltip>
            <Upload beforeUpload={handleUpload} showUploadList={false} disabled={isDemo}>
              <Button icon={<UploadOutlined />} disabled={isDemo}>Upload Image</Button>
            </Upload>
          </DemoTooltip>
          <Form.Item name="isPublished" label="Published" valuePropName="checked"><Switch /></Form.Item>
          <Form.Item name="isDemo" label="Demo Course" valuePropName="checked"><Switch /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
