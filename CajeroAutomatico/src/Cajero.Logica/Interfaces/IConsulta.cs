using System;
using System.Collections.Generic;
using System.Text;

namespace Cajero.Logica.Interfaces
{
    public interface IConsulta : IOperacion
    {
        decimal SaldoTotal { get; set; }
        decimal SaldoDisponible { get; set; }
    }
}
