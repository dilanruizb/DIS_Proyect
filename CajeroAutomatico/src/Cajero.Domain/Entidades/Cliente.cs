using System;
using System.Collections.Generic;
using System.Text;
using Cajero.Domain.Interfaces;
namespace Cajero.Domain.Entidades
{
    public class Cliente : ICliente
    {
        private int _idCliente;
        private string _nombre = string.Empty;
        private string _apellido = string.Empty;

        public int IdCliente
        {
            get { return _idCliente; }
            set { _idCliente = value; }
        }

        public string Nombre
        {
            get { return _nombre; }
            set { _nombre = value; }
        }

        public string Apellido
        {
            get { return _apellido; }
            set { _apellido = value; }
        }

        public Cliente()
        {
        }

        public Cliente(string nombre, string apellido)
        {
            _nombre = nombre;
            _apellido = apellido;
        }

        public string? seleccionarOperacion(IInteraccionCajero pantalla)
        {
            return pantalla.LeerOpcion();
        }

        public string? ingresarPIN(IInteraccionCajero pantalla)
        {
            return pantalla.LeerPIN();
        }

        public void finalizarSesion(IInteraccionCajero pantalla, Sesion sesion)
        {
            pantalla.SolicitarCierre(sesion);
        }
    }
}
