using Cajero.Controller;
using Cajero.Domain.Entidades;
using Cajero.Domain.Enums;
using Cajero.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Text;
using System;
using System.Collections.Generic;


namespace Cajero.View
{
    public class PantallaCajero : IInteraccionCajero
    {
        private readonly CajeroController _controlador;

        public PantallaCajero(CajeroController controlador)
        {
            _controlador = controlador;
        }

        public void Ejecutar()
        {
            Console.WriteLine("Cajero Automático");
            string? numero = SeleccionarTarjeta();
            if (numero == null)
            {
                return;
            }

            var resultado = _controlador.IngresarTarjeta(numero);
            var sesion = resultado.Sesion;

            if (sesion == null)
            {
                Console.WriteLine("No se pudo iniciar la sesión.");
                return;
            }

            if (resultado.Estado != EstadoValidacionTarjeta.Valida)
            {
                Console.WriteLine($"Tarjeta rechazada: {resultado.Estado}.");
            }

            var cliente = new Cliente { IdCliente = sesion.IdCliente };

            while (sesion.Estado == EstadoSesion.Validando)
            {
                string? pin = cliente.ingresarPIN(this);

                if (pin == null)
                {
                    _controlador.SolicitarCierre(sesion);
                    break;
                }

                if (_controlador.IngresarPIN(sesion, pin))
                {
                    break;
                }

                Console.WriteLine($"PIN incorrecto. Intentos fallidos: {sesion.IntentosPIN}.");
            }

            while (sesion.Estado == EstadoSesion.Operando)
            {
                Console.WriteLine();
                Console.WriteLine("1. Consultar saldo");
                Console.WriteLine("2. Extraer efectivo");
                Console.WriteLine("3. Transferir");
                Console.WriteLine("0. Finalizar sesión");
                Console.Write("Opción: ");

                switch (cliente.seleccionarOperacion(this))
                {
                    case "1":
                        var consulta = _controlador.ConsultarSaldo(sesion);

                        if (consulta == null)
                        {
                            Console.WriteLine("No se pudo consultar la cuenta.");
                            break;
                        }

                        consulta.mostrarSaldo(this);
                        break;

                    case "0":
                    case null:
                        cliente.finalizarSesion(this, sesion);
                        break;

                    default:
                        Console.WriteLine("Opción inválida.");
                        break;
                    case "2":
                        {
                            Console.Write("Monto a extraer: $");

                            if (!decimal.TryParse(Console.ReadLine(), out decimal monto))
                            {
                                Console.WriteLine("Ingresá un importe válido.");
                                break;
                            }

                            var resultadoExtraccion = _controlador.Extraer(sesion, monto);
                            Console.WriteLine(resultadoExtraccion.Mensaje);

                            Extraccion? extraccion = resultadoExtraccion.Operacion;
                            if (extraccion != null && extraccion.dispensarEfectivo(this))
                            {
                                Console.WriteLine($"Saldo disponible: ${extraccion.obtenerSaldoRestante():N2}.");
                            }

                            break;
                        }
                    case "3":
                        {
                            Console.Write("CBU de destino: ");
                            string? cbuDestino = Console.ReadLine();

                            if (string.IsNullOrWhiteSpace(cbuDestino))
                            {
                                Console.WriteLine("Ingresá el CBU de destino.");
                                break;
                            }

                            cbuDestino = cbuDestino.Trim();
                            bool cbuValido = cbuDestino.Length == 22;

                            foreach (char caracter in cbuDestino)
                            {
                                if (caracter < '0' || caracter > '9')
                                {
                                    cbuValido = false;
                                    break;
                                }
                            }

                            if (!cbuValido)
                            {
                                Console.WriteLine("El CBU debe tener 22 dígitos.");
                                break;
                            }

                            Console.Write("Monto a transferir: $");
                            if (!decimal.TryParse(Console.ReadLine(), out decimal monto) ||
                                monto <= 0 ||
                                decimal.Round(monto, 2) != monto)
                            {
                                Console.WriteLine("Ingresá un monto positivo con hasta dos decimales.");
                                break;
                            }

                            Console.WriteLine($"Vas a transferir ${monto:N2} al CBU {cbuDestino}.");
                            Console.Write("¿Confirmás la transferencia? (S/N): ");
                            string? confirmacion = Console.ReadLine();

                            if (confirmacion != "S" && confirmacion != "s")
                            {
                                Console.WriteLine("Transferencia cancelada.");
                                break;
                            }

                            string mensaje = _controlador.Transferir(sesion, cbuDestino, monto);
                            Console.WriteLine(mensaje);
                            break;
                        }
                }
            }

            if (sesion.Estado == EstadoSesion.Cerrando && sesion.Autenticada)
            {
                Console.Write("¿Querés un ticket? (S/N): ");
                string? respuesta = Console.ReadLine();

                if (respuesta == "S" || respuesta == "s")
                {
                    List<Operacion> operaciones = _controlador.ObtenerOperaciones(sesion);

                    Console.WriteLine();
                    Console.WriteLine("--- Ticket del cajero ---");
                    Console.WriteLine($"Sesión: {sesion.IdSesion}");
                    Console.WriteLine($"Inicio: {sesion.FechaHoraInicio:g}");

                    if (operaciones.Count == 0)
                    {
                        Console.WriteLine("No se registraron operaciones.");
                    }

                    foreach (Operacion operacion in operaciones)
                    {
                        Console.WriteLine(operacion.obtenerDetalle());
                    }

                    Console.WriteLine("-------------------------");
                }
            }
            Console.WriteLine("Retirá tu tarjeta.");
            _controlador.CompletarCierre(sesion);
            Console.WriteLine($"Estado final: {sesion.Estado}.");
        }

        private static string? SeleccionarTarjeta()
        {
            while (true)
            {
                Console.WriteLine("¿Con qué tarjeta querés ingresar?");
                Console.WriteLine("1. Tarjeta 1");
                Console.WriteLine("2. Tarjeta 2");
                Console.WriteLine("3. Tarjeta 3");
                Console.WriteLine("0. Salir");
                Console.Write("Opción: ");

                string? opcion = Console.ReadLine()?.Trim();

                switch (opcion)
                {
                    case "1":
                        return "1000000000000001";
                    case "2":
                        return "1000000000000002";
                    case "3":
                        return "1000000000000003";
                    case "0":
                    case null:
                        return null;
                    default:
                        Console.WriteLine("Opción inválida. Elegí 1, 2 o 3, o ingresá 0 para salir.");
                        Console.WriteLine();
                        break;
                }
            }
        }

        public string? LeerOpcion()
        {
            return Console.ReadLine();
        }

        public void SolicitarCierre(Sesion sesion)
        {
            _controlador.SolicitarCierre(sesion);
        }

        public void MostrarMensaje(string mensaje)
        {
            Console.WriteLine(mensaje);
        }

        public string? LeerPIN()
        {
            Console.Write("PIN (Esc para cancelar): ");
            string pin = "";

            while (true)
            {
                ConsoleKeyInfo tecla = Console.ReadKey(true);

                if (tecla.Key == ConsoleKey.Enter)
                {
                    Console.WriteLine();
                    return pin;
                }

                if (tecla.Key == ConsoleKey.Escape)
                {
                    Console.WriteLine();
                    return null;
                }

                if (tecla.Key == ConsoleKey.Backspace)
                {
                    if (pin.Length > 0)
                    {
                        pin = pin.Substring(0, pin.Length - 1);
                        Console.Write("\b \b");
                    }

                    continue;
                }

                if (tecla.KeyChar >= '0' && tecla.KeyChar <= '9')
                {
                    pin += tecla.KeyChar;
                    Console.Write("*");
                }
            }
        }
    }
}
