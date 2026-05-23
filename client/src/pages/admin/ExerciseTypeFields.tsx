import {
  Form,
  Input,
  Divider,
  Space,
  Upload,
  message,
  Button,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  UploadOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons';
import { useFiles } from '../../hooks/useFiles';
import { useIsDemoUser } from '../../hooks/useIsDemoUser';
import DemoTooltip from '../../components/admin/DemoTooltip';

interface Props {
  type: number;
  form: ReturnType<typeof Form.useForm>[0];
  onUpload: (url: string) => void;
}

export default function ExerciseTypeFields({ type, form, onUpload }: Props) {
  const files = useFiles();
  const isDemo = useIsDemoUser();
  const audioUrl = Form.useWatch('audioUrl', form);
  const isCorrectImage = Form.useWatch('is_correctImage', form);
  const isDi1 = Form.useWatch('is_di1', form);
  const isDi2 = Form.useWatch('is_di2', form);
  const isDi3 = Form.useWatch('is_di3', form);

  const uploadFile = async (file: File, field: string) => {
    const res = await files.upload(file);
    const url = res.url!;
    form.setFieldsValue({ [field]: url });
    onUpload(url);
    message.success('Uploaded');
    return false;
  };

  const imageUploadField = (fieldName: string, label: string, currentUrl: string | undefined) => (
    <Form.Item label={label} required>
      <Form.Item name={fieldName} noStyle rules={[{ required: true, message: `Upload ${label}` }]}>
        <input type="hidden" />
      </Form.Item>
      <Space size={12}>
        <DemoTooltip>
          <Upload accept="image/*" beforeUpload={(f) => { uploadFile(f, fieldName); return false; }} showUploadList={false} disabled={isDemo}>
            <Button icon={<UploadOutlined />} disabled={isDemo}>Upload Image</Button>
          </Upload>
        </DemoTooltip>
        {currentUrl
          ? <Typography.Text type="success">✓ {currentUrl.split('/').pop()}</Typography.Text>
          : <Typography.Text type="secondary">No file selected</Typography.Text>
        }
      </Space>
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
      <Space size={12}>
        <DemoTooltip>
          <Upload accept="audio/*" beforeUpload={(f) => { uploadFile(f, 'audioUrl'); return false; }} showUploadList={false} disabled={isDemo}>
            <Button icon={<UploadOutlined />} disabled={isDemo}>Upload Audio</Button>
          </Upload>
        </DemoTooltip>
        {audioUrl
          ? <Typography.Text type="success">✓ {audioUrl.split('/').pop()}</Typography.Text>
          : <Typography.Text type="secondary">No file selected</Typography.Text>
        }
      </Space>
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
          <Typography.Paragraph type="secondary" style={{ marginBottom: 8 }}>
            Add word/translation pairs (minimum 3)
          </Typography.Paragraph>
          <Form.List name="mp_pairs" initialValue={[{ word: '', translation: '' }, { word: '', translation: '' }, { word: '', translation: '' }]}>
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...rest }) => (
                  <Space key={key} align="baseline" style={{ marginBottom: 8 }}>
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
    case 5: {
      const separatorHint = (
        <>
          Separator:{' '}
          <span style={{ cursor: 'copy' }}>
            <code style={{ userSelect: 'all' }}>,</code>
          </span>
        </>
      );
      return (
        <>
          <Form.Item name="wb_prompt" label="Prompt (English sentence)" rules={[{ required: true }]}><Input placeholder="e.g. The dog is big" /></Form.Item>
          <Form.Item name="wb_correctOrder" label="Correct Word Order (comma-separated)" rules={[{ required: true }]} extra={separatorHint}>
            <Input placeholder="e.g. The, dog, is, big" />
          </Form.Item>
          <Form.Item name="wb_distractors" label="Distractor Words (comma-separated)" extra={separatorHint}>
            <Input placeholder="e.g. cat, small" />
          </Form.Item>
        </>
      );
    }
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
          <Divider />
          {audioUploadField(false)}
        </>
      );
    default:
      return null;
  }
}
