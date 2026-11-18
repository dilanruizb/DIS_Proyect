using System;
using System.Collections.Generic;
using System.Text;

namespace Cajero.Logica.Interfaces
{
    public interface ICliente
    {
        int IdCliente { get; set; }
        string Nombre { get; set; }
        string Apellido { get; set; }
    }
}
