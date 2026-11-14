using System;
using System.Collections.Generic;
using System.Text;
using Cajero.Domain.Entidades;
using Cajero.Domain.Interfaces;

namespace Cajero.Data
{
    public class RepositorioSesiones : IRepositorioSesiones
    {
        private readonly CajeroDbContext _contexto;

        public RepositorioSesiones(CajeroDbContext contexto)
        {
            _contexto = contexto;
        }

        public void Guardar(Sesion sesion)
        {
            if (sesion.IdSesion == 0)
            {
                _contexto.Sesiones.Add(sesion);
            }

            _contexto.SaveChanges();
        }
        public List<Operacion> ObtenerOperaciones(int idSesion)
        {
            return _contexto.Operaciones
                .Where(operacion => operacion.IdSesion == idSesion)
                .OrderBy(operacion => operacion.NumeroOperacion)
                .ToList();
        }
    }
}
