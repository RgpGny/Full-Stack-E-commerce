import React, { useState } from "react";
import { Card, Button, Typography, Space, Tag, Tooltip, message } from "antd";
import { 
  ShoppingCartOutlined, 
  HeartOutlined,
  HeartFilled,
  StarFilled,
  EyeOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Text, Title } = Typography;
const { Meta } = Card;

export const ProductCard = ({ 
  id, 
  image, 
  price, 
  name, 
  description,
  stock = 10,
  rating = 4.5,
  discount = null,
  isNew = false
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    setIsLoading(true);
    try {
      // Sepete ekleme işlemi burada yapılacak
      message.success(`${name} sepete eklendi!`);
    } catch (error) {
      message.error("Ürün sepete eklenirken hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = (e) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    message.success(isLiked ? "Favorilerden çıkarıldı" : "Favorilere eklendi");
  };

  const handleCardClick = () => {
    if (id) {
      navigate(`/app/product/${id}`);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  const originalPrice = discount ? price : null;
  const discountedPrice = discount ? price * (1 - discount / 100) : price;

  return (
    <Card
      hoverable
      className="product-card-modern border-0 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer relative overflow-hidden"
      style={{ borderRadius: 'var(--radius-lg)' }}
      cover={
        <div className="relative">
          <img 
            alt={name} 
            src={image || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTA1IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Q0EzQUYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPsOccnVuIEfDtnJzZWxpPC90ZXh0Pgo8L3N2Zz4K"} 
            className="object-cover h-48 w-full transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTA1IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Q0EzQUYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPsOccnVuIEfDtnJzZWxpPC90ZXh0Pgo8L3N2Zz4K";
              e.target.onerror = null; // Sonsuz döngüyü önle
            }}
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {isNew && (
              <Tag color="green" className="text-xs font-semibold">
                YENİ
              </Tag>
            )}
            {discount && (
              <Tag color="red" className="text-xs font-semibold">
                %{discount} İNDİRİM
              </Tag>
            )}
            {stock < 5 && stock > 0 && (
              <Tag color="orange" className="text-xs font-semibold">
                SON {stock} ADET
              </Tag>
            )}
            {stock === 0 && (
              <Tag color="volcano" className="text-xs font-semibold">
                STOKTA YOK
              </Tag>
            )}
          </div>

          {/* Like Button */}
          <Button
            icon={isLiked ? <HeartFilled /> : <HeartOutlined />}
            className={`absolute top-2 right-2 border-0 shadow-sm ${
              isLiked ? 'text-red-500 bg-white' : 'text-gray-600 bg-white hover:text-red-500'
            }`}
            size="small"
            shape="circle"
            onClick={handleLike}
          />

          {/* Quick View Button */}
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 hover:opacity-100">
            <Button
              icon={<EyeOutlined />}
              className="text-white border-white hover:bg-white hover:text-gray-800"
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick();
              }}
            >
              Ürünü İncele
            </Button>
          </div>
        </div>
      }
      bodyStyle={{ padding: '16px' }}
      onClick={handleCardClick}
    >
      <div className="space-y-2">
        {/* Product Name */}
        <Title 
          level={5} 
          className="mb-1 line-clamp-2 text-gray-800 hover:text-blue-600 transition-colors"
          style={{ 
            height: '48px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: '1.2'
          }}
        >
          {name}
        </Title>

        {/* Description */}
        {description && (
          <Text 
            className="text-gray-500 text-sm line-clamp-2" 
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              height: '36px',
              lineHeight: '1.2'
            }}
          >
            {description}
          </Text>
        )}

        {/* Rating */}
        <div className="flex items-center gap-1">
          <StarFilled className="text-yellow-400 text-sm" />
          <Text className="text-sm text-gray-600">{rating}</Text>
          <Text className="text-xs text-gray-400">(127 değerlendirme)</Text>
        </div>

        {/* Price Section */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            {discount ? (
              <>
                <Text className="text-lg font-bold text-red-600">
                  {formatPrice(discountedPrice)}
                </Text>
                <Text className="text-sm text-gray-400 line-through">
                  {formatPrice(originalPrice)}
                </Text>
              </>
            ) : (
              <Text className="text-lg font-bold text-gray-800">
                {formatPrice(price)}
              </Text>
            )}
          </div>

          {/* Add to Cart Button */}
          <Button 
            type="primary" 
            icon={<ShoppingCartOutlined />}
            size="small"
            loading={isLoading}
            disabled={stock === 0}
            onClick={handleAddToCart}
            className="font-semibold h-8 px-3"
            style={{
              backgroundColor: stock === 0 ? '#d9d9d9' : 'var(--color-primary)',
              borderColor: stock === 0 ? '#d9d9d9' : 'var(--color-primary)'
            }}
          >
            {stock === 0 ? 'Stokta Yok' : 'Sepete Ekle'}
          </Button>
        </div>

        {/* Stock Warning */}
        {stock > 0 && stock < 5 && (
          <div className="bg-orange-50 border border-orange-200 rounded-md p-2">
            <Text className="text-xs text-orange-600 font-medium">
              ⚠️ Sadece {stock} adet kaldı! Hemen sipariş verin.
            </Text>
          </div>
        )}
      </div>
    </Card>
  );
};
