using System;
using Cajero.Logica.Interfaces;

namespace Cajero.Logica.Entidades
{
    public abstract class Operacion : IOperacion
    {
        private int _numeroOperacion;
        private DateTime _fechaHora;
        private string _estado = string.Empty;
        private int _idSesion;
        private string _numeroCuenta = string.Empty;
        private Cuenta? _cuenta;
        private Sesion? _sesion;

        public int NumeroOperacion
        {
            get { return _numeroOperacion; }
            set { _numeroOperacion = value; }
        }

        public DateTime FechaHora
        {
            get { return _fechaHora; }
            set { _fechaHora = value; }
        }

        public string Estado
        {
            get { return _estado; }
            set { _estado = value; }
        }

        public int IdSesion
        {
            get { return _idSesion; }
            set { _idSesion = value; }
        }

        public string NumeroCuenta
        {
            get { return _numeroCuenta; }
            set { _numeroCuenta = value; }
        }

        public Cuenta? Cuenta
        {
            get { return _cuenta; }
            set { _cuenta = value; }
        }

        protected Operacion()
        {
        }

        protected Operacion(int idSesion, string numeroCuenta, DateTime fechaHora)
        {
            _idSesion = idSesion;
            _numeroCuenta = numeroCuenta;
            _fechaHora = fechaHora;
        }

        public virtual string obtenerDetalle()
        {
            return $"{FechaHora:t} - {GetType().Name} - {Estado}";
        }

        public Sesion? Sesion
        {
            get { return _sesion; }
            set { _sesion = value; }
        }

        public void registrar()
        {
            if (Sesion == null)
            {
                throw new InvalidOperationException("La operación no tiene una sesión asociada.");
            }

            Sesion.agregarOperacion(this);
        }

        public abstract bool ejecutar();
    }
}
