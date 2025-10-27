export default function Footer() {
  return (
    <footer className="border-t bg-white/90">
      <div className="mx-auto flex max-w-6xl items-center justify-between p-6 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <img src="https://cdn-icons-png.flaticon.com/512/2913/2913465.png" className="w-6" alt="logo" />
          <span className="font-semibold text-green-700">AgroAware</span>
        </div>
        <p>© {new Date().getFullYear()} Smart Farming Assistance System</p>
      </div>
    </footer>
  );
}