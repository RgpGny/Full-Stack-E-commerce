import React, { useState } from "react";
import { UserOutlined, LockOutlined, MailOutlined, EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { Form, Input, Button, message, Modal, Card, Typography, Divider } from "antd";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { loginUser, registerUser, sendVerificationEmail } from "../utils/Api";
import { AuthContext } from "../context/AuthContext";

const { Title, Text, Link } = Typography;

export const LoginPage = () => {
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuthData } = useContext(AuthContext);

  const handleMode = () => {
    setMode((prevMode) => (prevMode === "login" ? "signup" : "login"));
  };

  const handleResendVerification = async () => {
    try {
      await sendVerificationEmail();
      message.success("Yeni doğrulama email'i gönderildi! Lütfen email'inizi kontrol edin.");
    } catch (error) {
      message.error("Doğrulama email'i gönderilemedi. Lütfen daha sonra tekrar deneyin.");
    }
  };

  const showEmailVerificationModal = () => {
    Modal.confirm({
      title: '📧 Email Doğrulama Gerekli',
      content: (
        <div className="py-4">
          <p className="text-gray-600 mb-3">
            Giriş yapabilmek için email adresinizi doğrulamanız gerekiyor.
          </p>
          <p className="text-gray-600">
            Email'inizi kontrol edip doğrulama linkine tıklayın veya yeni bir doğrulama email'i gönderebilirsiniz.
          </p>
        </div>
      ),
      okText: 'Yeni Email Gönder',
      cancelText: 'Tamam',
      onOk: handleResendVerification,
      okButtonProps: {
        style: {
          backgroundColor: 'var(--color-primary)',
          borderColor: 'var(--color-primary)',
        }
      }
    });
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      if (mode === "login") {
        const response = await loginUser(values.email, values.password);
        message.success("Giriş başarılı! 🎉");
        setAuthData(response.user);
        navigate("/app");
      } else {
        const response = await registerUser(values.username, values.email, values.password);
        
        if (response.emailSent) {
          message.success("Kayıt başarılı! 📧 E-mail adresinize doğrulama linki gönderildi.");
        } else {
          message.success("Kayıt başarılı! ✅ Lütfen giriş yapın.");
        }
        
        setMode("login");
        return;
      }
    } catch (error) {
      console.error("Error during login/register:", error);
      
      if (mode === "login" && error?.includes("Email adresinizi doğrulamanız")) {
        showEmailVerificationModal();
        return;
      }
      
      message.error(error || (mode === "login" 
        ? "Giriş başarısız, lütfen bilgilerinizi kontrol edin." 
        : "Kayıt başarısız, lütfen tekrar deneyin."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Brand */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <UserOutlined className="text-white text-2xl" />
          </div>
          <Title level={2} className="mb-2" style={{ color: 'var(--color-text-primary)', fontWeight: 700 }}>
            E-Ticaret
          </Title>
          <Text className="text-gray-500">
            {mode === "login" ? "Hesabınıza giriş yapın" : "Yeni hesap oluşturun"}
          </Text>
        </div>

        {/* Main Card */}
        <Card
          className="shadow-lg border-0"
          style={{
            borderRadius: 'var(--radius-xl)',
            backgroundColor: 'var(--color-background)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}
        >
          <Form
            layout="vertical"
            onFinish={handleSubmit}
            size="large"
            requiredMark={false}
          >
            {/* Signup Username Field */}
            {mode === "signup" && (
              <Form.Item
                name="username"
                label={<span className="text-gray-700 font-medium">Kullanıcı Adı</span>}
                rules={[
                  { required: true, message: "Lütfen kullanıcı adınızı girin" },
                  { min: 3, message: "Kullanıcı adı en az 3 karakter olmalıdır" },
                  { max: 50, message: "Kullanıcı adı en fazla 50 karakter olabilir" }
                ]}
                className="mb-4"
              >
                <Input
                  prefix={<UserOutlined className="text-gray-400" />}
                  placeholder="Kullanıcı adınızı girin"
                  className="input-modern h-12"
                  style={{
                    borderRadius: 'var(--radius-base)',
                    border: '2px solid var(--color-border)',
                    fontSize: '16px'
                  }}
                />
              </Form.Item>
            )}

            {/* Email Field */}
            <Form.Item
              name="email"
              label={<span className="text-gray-700 font-medium">E-posta</span>}
              rules={[
                { required: true, message: "Lütfen e-posta adresinizi girin" },
                { type: "email", message: "Geçerli bir e-posta adresi girin" }
              ]}
              className="mb-4"
            >
              <Input
                prefix={<MailOutlined className="text-gray-400" />}
                placeholder="ornek@email.com"
                className="input-modern h-12"
                style={{
                  borderRadius: 'var(--radius-base)',
                  border: '2px solid var(--color-border)',
                  fontSize: '16px'
                }}
              />
            </Form.Item>

            {/* Password Field */}
            <Form.Item
              name="password"
              label={<span className="text-gray-700 font-medium">Şifre</span>}
              rules={[
                { required: true, message: "Lütfen şifrenizi girin" },
                ...(mode === "signup" ? [
                  { min: 8, message: "Şifre en az 8 karakter olmalıdır" },
                  {
                    pattern: /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                    message: "Şifre en az 1 küçük harf, 1 büyük harf ve 1 rakam içermelidir"
                  }
                ] : [])
              ]}
              className="mb-6"
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="Şifrenizi girin"
                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                className="input-modern h-12"
                style={{
                  borderRadius: 'var(--radius-base)',
                  border: '2px solid var(--color-border)',
                  fontSize: '16px'
                }}
              />
            </Form.Item>

            {/* Forgot Password Link - Login Mode Only */}
            {mode === "login" && (
              <div className="text-right mb-6">
                <Link 
                  onClick={() => navigate('/forgot-password')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Şifremi Unuttum
                </Link>
              </div>
            )}

            {/* Submit Button */}
            <Form.Item className="mb-6">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
                className="h-12 font-semibold text-base"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  borderColor: 'var(--color-primary)',
                  borderRadius: 'var(--radius-base)',
                  boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)',
                  border: 'none'
                }}
              >
                {mode === "login" ? "Giriş Yap" : "Kayıt Ol"}
              </Button>
            </Form.Item>

            {/* Mode Switch */}
            <Divider className="my-6">
              <span className="text-gray-400 text-sm">veya</span>
            </Divider>

            <div className="text-center">
              <Text className="text-gray-600">
                {mode === "login" ? "Henüz hesabınız yok mu? " : "Zaten hesabınız var mı? "}
                <Link
                  onClick={handleMode}
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  {mode === "login" ? "Kayıt Ol" : "Giriş Yap"}
                </Link>
              </Text>
            </div>
          </Form>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <Text className="text-gray-400 text-sm">
            © 2024 E-Ticaret. Tüm hakları saklıdır.
          </Text>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
