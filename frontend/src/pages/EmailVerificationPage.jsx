import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { message, Card, Spin, Button, Result } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { verifyEmail as verifyEmailAPI, sendVerificationEmail } from '../utils/Api';

const EmailVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setError('Geçersiz doğrulama linki');
      setLoading(false);
      return;
    }

    verifyEmailToken(token);
  }, [searchParams]);

  const verifyEmailToken = async (token) => {
    try {
      const response = await verifyEmailAPI(token);
      
      if (response.user) {
        setVerified(true);
        setUserInfo(response.user);
        message.success('Email adresiniz başarıyla doğrulandı! 🎉');
      }
    } catch (error) {
      console.error('Email verification error:', error);
      setError(
        error || 
        'Email doğrulama sırasında bir hata oluştu'
      );
      message.error('Email doğrulama başarısız');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      await sendVerificationEmail();
      message.success('Yeni doğrulama emaili gönderildi');
    } catch (error) {
      message.error('Email gönderilemedi. Lütfen daha sonra tekrar deneyin.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-600">Email doğrulanıyor...</p>
        </Card>
      </div>
    );
  }

  if (verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <Result
            icon={<CheckCircleOutlined className="text-green-500" />}
            status="success"
            title="Email Doğrulandı! 🎉"
            subTitle={
              <div className="space-y-2">
                <p>Merhaba <strong>{userInfo?.username}</strong>!</p>
                <p>Email adresiniz başarıyla doğrulandı.</p>
                <p>Artık tüm özelliklerimizi kullanabilirsiniz.</p>
              </div>
            }
            extra={[
              <Button 
                type="primary" 
                key="login"
                onClick={() => navigate('/login')}
                className="mr-2"
              >
                Giriş Yap
              </Button>,
              <Button 
                key="home"
                onClick={() => navigate('/')}
              >
                Ana Sayfa
              </Button>
            ]}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <Result
          icon={<CloseCircleOutlined className="text-red-500" />}
          status="error"
          title="Doğrulama Başarısız"
          subTitle={
            <div className="space-y-2">
              <p>{error}</p>
              <p className="text-sm text-gray-500">
                Bu durum şu nedenlerle oluşabilir:
              </p>
              <ul className="text-sm text-gray-500 text-left">
                <li>• Linkin süresi dolmuş olabilir (24 saat)</li>
                <li>• Link daha önce kullanılmış olabilir</li>
                <li>• Geçersiz bir link olabilir</li>
              </ul>
            </div>
          }
          extra={[
            <Button 
              type="primary" 
              key="resend"
              onClick={handleResendVerification}
              className="mr-2"
            >
              Yeni Email Gönder
            </Button>,
            <Button 
              key="home"
              onClick={() => navigate('/')}
            >
              Ana Sayfa
            </Button>
          ]}
        />
      </Card>
    </div>
  );
};

export default EmailVerificationPage; 