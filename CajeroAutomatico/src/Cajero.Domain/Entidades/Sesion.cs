using System;
using System.Collections.Generic;
using Cajero.Domain.Enums;
using Cajero.Domain.Interfaces;

namespace Cajero.Domain.Entidades
{
    public class Sesion : ISesion
    {
        private int _idSesion;
        private DateTime _fechaHoraInicio;
        private DateTime? _fechaHoraFin;
        private bool _autenticada;
        private int _intentosPIN;
        private EstadoSesion _estado = EstadoSesion.Iniciada;
        private int _idCliente;
        private string _numeroTarjeta = string.Empty;
        private List<Operacion> _operaciones = new List<Operacion>();

        public int IdSesion
        {
            get { return _idSesion; }
            set { _idSesion = value; }
        }

        public DateTime FechaHoraInicio
        {
            get { return _fechaHoraInicio; }
            set { _fechaHoraInicio = value; }
        }

        public DateTime? FechaHoraFin
        {
            get { return _fechaHoraFin; }
            set { _fechaHoraFin = value; }
        }

        public bool Autenticada
        {
            get { return _autenticada; }
            set { _autenticada = value; }
        }

        public int IntentosPIN
        {
            get { return _intentosPIN; }
            set { _intentosPIN = value; }
        }

        public EstadoSesion Estado
        {
            get { return _estado; }
            set { _estado = value; }
        }

        public int IdCliente
        {
            get { return _idCliente; }
            set { _idCliente = value; }
        }

        public string NumeroTarjeta
        {
            get { return _numeroTarjeta; }
            set { _numeroTarjeta = value; }
        }

        public List<Operacion> Operaciones
        {
            get { return _operaciones; }
            set { _operaciones = value; }
        }

        private const int MaxIntentosPIN = 3;

        public void autenticar()
        {
            _autenticada = true;
            _estado = EstadoSesion.Operando;
        }

        public int registrarIntentoFallido()
        {
            _intentosPIN++;
            if (_intentosPIN >= MaxIntentosPIN)
            {
                _estado = EstadoSesion.Cerrando;
            }

            return _intentosPIN;
        }

        public void cerrar()
        {
            _fechaHoraFin = DateTime.Now;
            _autenticada = false;
            _estado = EstadoSesion.Cerrada;
        }

        public bool estaAutenticada()
        {
            return _autenticada;
        }

        public void agregarOperacion(Operacion operacion)
        {
            operacion.IdSesion = _idSesion;
            if (!_operaciones.Contains(operacion))
            {
                _operaciones.Add(operacion);
            }
        }

        public List<Operacion> obtenerOperaciones()
        {
            return new List<Operacion>(_operaciones);
        }

        public void iniciar()
        {
            _fechaHoraInicio = DateTime.Now;
            _estado = EstadoSesion.Iniciada;
            _intentosPIN = 0;
            _autenticada = false;
            _fechaHoraFin = null;
        }

        public Sesion()
        {
        }

        public Sesion(DateTime fechaHoraInicio)
        {
            _fechaHoraInicio = fechaHoraInicio;
        }
    }
}
