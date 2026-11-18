using System;
using Cajero.Logica.Interfaces;

namespace Cajero.Logica.Entidades
{
    public class Tarjeta : ITarjeta
    {
        private string _numero = string.Empty;
        private DateOnly _fechaVencimiento;
        private bool _bloqueada;
        private string _entidadEmisora = string.Empty;
        private int _idCliente;
        private string _numeroCuenta = string.Empty;

        public string Numero
        {
            get { return _numero; }
            set { _numero = value; }
        }

        public DateOnly FechaVencimiento
        {
            get { return _fechaVencimiento; }
            set { _fechaVencimiento = value; }
        }

        public bool Bloqueada
        {
            get { return _bloqueada; }
            set { _bloqueada = value; }
        }

        public string EntidadEmisora
        {
            get { return _entidadEmisora; }
            set { _entidadEmisora = value; }
        }

        public int IdCliente
        {
            get { return _idCliente; }
            set { _idCliente = value; }
        }

        public string NumeroCuenta
        {
            get { return _numeroCuenta; }
            set { _numeroCuenta = value; }
        }

        public bool validar()
        {
            return !estaBloqueada() && !estaVencida();
        }

        public bool estaVencida()
        {
            return _fechaVencimiento < DateOnly.FromDateTime(DateTime.Today);
        }

        public bool estaBloqueada()
        {
            return _bloqueada;
        }

        public Tarjeta()
        {
        }

        public Tarjeta(
            string numero,
            DateOnly fechaVencimiento,
            string entidadEmisora,
            int idCliente,
            string numeroCuenta)
        {
            _numero = numero;
            _fechaVencimiento = fechaVencimiento;
            _entidadEmisora = entidadEmisora;
            _idCliente = idCliente;
            _numeroCuenta = numeroCuenta;
            _bloqueada = false;
        }
    }
}