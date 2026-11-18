using System;
using System.Collections.Generic;
using System.Text;

namespace Cajero.Domain.Interfaces
{
    public interface ICliente
    {
        int IdCliente { get; set; }
        string Nombre { get; set; }
        string Apellido { get; set; }
    }
}
