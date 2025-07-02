import { useState } from 'react';
import { Form, Input, Button, Card, message, Alert } from 'antd';
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { requestPasswordReset } from '../utils/Api';

const ForgotPasswordPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    
    try {
      await requestPasswordReset(values.email);
      
      setEmail(values.email);
      setEmailSent(true);
      message.success('Şifre sıfırlama linki gönderildi!');
      
    } catch (error) {
      // Backend güvenlik nedeniyle her zaman aynı mesajı döndürür
      setEmail(values.email);
      setEmailSent(true);
      message.success('Şifre sıfırlama linki gönderildi!');
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setLoading(true);
    
    try {
      await requestPasswordReset(email);
      message.success('Email tekrar gönderildi!');
    } catch (error) {
      message.success('Email tekrar gönderildi!');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <div className="text-center mb-6">
            <MailOutlined className="text-4xl text-blue-500 mb-2" />
            <h2 className="text-2xl font-bold text-gray-800">Email Gönderildi! 📧</h2>
          </div>

          <Alert
            message="Şifre Sıfırlama Linki Gönderildi"
            description={
              <div className="space-y-2">
                <p>
                  Eğer <strong>{email}</strong> sistemimizde kayıtlıysa, 
                  şifre sıfırlama linki gönderildi.
                </p>
                <p className="text-sm text-gray-600">
                  • Email gelmezse spam klasörünü kontrol edin
                  <br />
                  • Link 1 saat geçerlidir
                  <br />
                  • Her link sadece bir kez kullanılabilir
                </p>
              </div>
            }
            type="success"
            showIcon
            className="mb-6"
          />

          <div className="space-y-3">
            <Button
              type="primary"
              block
              onClick={() => navigate('/login')}
              size="large"
            >
              Giriş Sayfasına Dön
            </Button>
            
            <Button
              block
              onClick={handleResendEmail}
              loading={loading}
              disabled={loading}
            >
              Emaili Tekrar Gönder
            </Button>
          </div>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-500">
              Email gelmediyse{' '}
              <Button 
                type="link" 
                className="p-0 h-auto"
                onClick={() => setEmailSent(false)}
              >
                farklı email adresi dene
              </Button>
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <MailOutlined className="text-4xl text-blue-500 mb-2" />
          <h2 className="text-2xl font-bold text-gray-800">Şifremi Unuttum</h2>
          <p className="text-gray-600 mt-2">
            Email adresinize şifre sıfırlama linki göndereceğiz
          </p>
        </div>

        <Form
          form={form}
          onFinish={onFinish}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="email"
            label="Email Adresi"
            rules={[
              { required: true, message: 'Email adresi gerekli!' },
              { type: 'email', message: 'Geçerli bir email adresi girin!' }
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="ornek@email.com"
              size="large"
            />
          </Form.Item>

          <Alert
            message="Güvenlik Bilgisi"
            description="Güvenlik nedeniyle, girdiğiniz email adresinin sistemimizde olup olmadığını belirtmiyoruz. Eğer email adresiniz kayıtlıysa link gönderilecektir."
            type="info"
            showIcon
            className="mb-4"
          />

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              className="bg-blue-500 hover:bg-blue-600"
            >
              {loading ? 'Gönderiliyor...' : 'Şifre Sıfırlama Linki Gönder'}
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center space-y-2">
          <Button 
            type="link" 
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/login')}
            className="text-gray-500"
          >
            Giriş sayfasına dön
          </Button>
          
          <p className="text-sm text-gray-500">
            Hesabınız yok mu?{' '}
            <Button 
              type="link" 
              className="p-0 h-auto"
              onClick={() => navigate('/register')}
            >
              Kayıt ol
            </Button>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage; 