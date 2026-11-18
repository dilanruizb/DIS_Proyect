using Cajero.Logica.Entidades;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
using Cajero.Logica.Enums;
using Cajero.Logica.Interfaces;
using Cajero.Logica.Resultados;

namespace Cajero.Datos
{
    public class SucursalDB : ISucursalDB
    {
        private readonly CajeroDbContext _contexto;

        public SucursalDB(CajeroDbContext contexto)
        {
            _contexto = contexto;
        }

        public ResultadoTarjeta validarTarjeta(string numero)
        {
            var tarjeta = _contexto.Tarjetas
                .AsNoTracking()
                .SingleOrDefault(tarjeta => tarjeta.Numero == numero.Trim());

            if (tarjeta == null)
            {
                return new ResultadoTarjeta { Estado = EstadoValidacionTarjeta.NoEncontrada, Tarjeta = null };
            }

            if (tarjeta.validar())
            {
                return new ResultadoTarjeta { Estado = EstadoValidacionTarjeta.Valida, Tarjeta = tarjeta };
            }

            if (tarjeta.estaBloqueada())
            {
                return new ResultadoTarjeta { Estado = EstadoValidacionTarjeta.Bloqueada, Tarjeta = tarjeta };
            }

            return new ResultadoTarjeta { Estado = EstadoValidacionTarjeta.Vencida, Tarjeta = tarjeta };
        }
    }
}
