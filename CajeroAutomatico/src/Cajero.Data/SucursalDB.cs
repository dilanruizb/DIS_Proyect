using Cajero.Domain.Entidades;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
using Cajero.Domain.Enums;
using Cajero.Domain.Interfaces;
using Cajero.Domain.Resultados;

namespace Cajero.Data
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
