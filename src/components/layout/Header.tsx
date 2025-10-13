import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-dark-800/80 backdrop-blur-md border-b border-dark-700/50 p-6">
      <div className="flex items-center justify-between">
        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-bold text-white">Bienvenido al Panel</h1>
          <p className="text-dark-400">Gestiona tu negocio desde un solo lugar</p>
        </div>

        {/* User Info */}
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-white font-medium">Administrador</p>
            <p className="text-dark-400 text-sm">Alfa Mobile PE</p>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
            <i className="bi bi-person text-white"></i>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;