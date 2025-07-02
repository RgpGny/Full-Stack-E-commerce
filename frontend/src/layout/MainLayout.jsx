import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

function MainLayout() {
  return (
    <div className="layout-stable flex flex-col min-h-screen">
      <Header />
      <main className="content-stable flex-grow">
        <Outlet /> {/* Sayfaların içeriği burada render edilecek */}
      </main>
      <Footer />
    </div>
  );
}

export default MainLayout;
