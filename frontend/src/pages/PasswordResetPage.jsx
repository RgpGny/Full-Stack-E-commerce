import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, message, Alert, Progress } from 'antd';
import { LockOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { validateResetToken, resetPassword } from '../utils/Api';

const PasswordResetPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      message.error('Geçersiz şifre sıfırlama linki');
      navigate('/login');
      return;
    }

    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      const response = await validateResetToken(token);
      setTokenValid(true);
      setUserEmail(response.email);
    } catch (error) {
      message.error('Geçersiz veya süresi dolmuş token');
      setTokenValid(false);
    } finally {
      setValidating(false);
    }
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 25;
    
    return strength;
  };

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setPasswordStrength(calculatePasswordStrength(password));
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 50) return '#ff4d4f';
    if (passwordStrength < 75) return '#faad14';
    return '#52c41a';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 50) return 'Zayıf';
    if (passwordStrength < 75) return 'Orta';
    return 'Güçlü';
  };

  const onFinish = async (values) => {
    setLoading(true);
    
    try {
      await resetPassword(token, values.password);
      
      message.success('Şifreniz başarıyla sıfırlandı! 🎉');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (error) {
      message.error(
        error.response?.data?.message || 
        'Şifre sıfırlama başarısız'
      );
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card loading className="w-full max-w-md">
          <p>Token doğrulanıyor...</p>
        </Card>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <Alert
            message="Geçersiz Token"
            description="Bu şifre sıfırlama linki geçersiz veya süresi dolmuş. Lütfen yeni bir şifre sıfırlama talebi oluşturun."
            type="error"
            showIcon
            className="mb-4"
          />
          <div className="flex gap-2">
            <Button type="primary" onClick={() => navigate('/login')}>
              Giriş Sayfası
            </Button>
            <Button onClick={() => navigate('/forgot-password')}>
              Yeni Talep
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <LockOutlined className="text-4xl text-blue-500 mb-2" />
          <h2 className="text-2xl font-bold text-gray-800">Şifre Sıfırla</h2>
          <p className="text-gray-600 mt-2">
            <strong>{userEmail}</strong> için yeni şifre oluşturun
          </p>
        </div>

        <Form
          form={form}
          onFinish={onFinish}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="password"
            label="Yeni Şifre"
            rules={[
              { required: true, message: 'Şifre gerekli!' },
              { min: 8, message: 'Şifre en az 8 karakter olmalı!' },
              {
                pattern: /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message: 'Şifre en az 1 küçük, 1 büyük harf ve 1 rakam içermeli!'
              }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Yeni şifrenizi girin"
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              onChange={handlePasswordChange}
            />
          </Form.Item>

          {/* Şifre güçlülük göstergesi */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-600">Şifre Güçlülüğü:</span>
              <span 
                className="text-sm font-medium"
                style={{ color: getPasswordStrengthColor() }}
              >
                {getPasswordStrengthText()}
              </span>
            </div>
            <Progress
              percent={passwordStrength}
              strokeColor={getPasswordStrengthColor()}
              showInfo={false}
              size="small"
            />
          </div>

          <Form.Item
            name="confirmPassword"
            label="Şifre Tekrar"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Şifre tekrarı gerekli!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Şifreler eşleşmiyor!'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Şifrenizi tekrar girin"
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>

          <Alert
            message="Güvenlik İpuçları"
            description={
              <ul className="text-sm">
                <li>• En az 8 karakter kullanın</li>
                <li>• Büyük ve küçük harf karışımı</li>
                <li>• En az 1 rakam ekleyin</li>
                <li>• Kişisel bilgilerinizi kullanmayın</li>
              </ul>
            }
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
              {loading ? 'Şifre Sıfırlanıyor...' : 'Şifreyi Sıfırla'}
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center">
          <Button 
            type="link" 
            onClick={() => navigate('/login')}
            className="text-gray-500"
          >
            ← Giriş sayfasına dön
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PasswordResetPage; 