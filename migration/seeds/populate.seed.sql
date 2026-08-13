DO $$
DECLARE
    -- =========================================================
    -- CONFIGURACIÓN
    -- =========================================================
    v_users_count                int := 100;
    v_sessions_per_user          int := 2;
    v_rules_per_user             int := 10;
    v_recurring_months           int := 36;
    v_transactions_per_user      int := 500;

    -- Permite ejecutar el seed varias veces sin colisión de emails
    v_batch text := to_char(clock_timestamp(), 'YYYYMMDDHH24MISSMS');

    -- =========================================================
    -- IDS / VARIABLES
    -- =========================================================
    v_user_id uuid;
    v_category_id uuid;
    v_rule_id uuid;

    v_direction text;
    v_status text;
    v_amount_mode text;

    v_amount numeric(14,2);
    v_estimated numeric(14,2);
    v_min numeric(14,2);
    v_max numeric(14,2);

    v_period date;
    v_due_date date;

    v_created_at timestamptz;
    v_occurred_at timestamptz;
    v_actual_amount numeric(14,2);

    v_day int;
    v_rnd double precision;

    i int;
    j int;
    m int;

    v_expense_categories text[] := ARRAY[
        'Supermercado',
        'Restaurantes',
        'Transporte',
        'Alquiler',
        'Electricidad',
        'Agua',
        'Internet',
        'Teléfono',
        'Salud',
        'Farmacia',
        'Educación',
        'Entretenimiento',
        'Viajes',
        'Ropa',
        'Hogar'
    ];

    v_income_categories text[] := ARRAY[
        'Salario',
        'Freelance',
        'Inversiones',
        'Bonificaciones',
        'Ventas'
    ];

    v_both_categories text[] := ARRAY[
        'Transferencias',
        'Ajustes'
    ];

BEGIN
    RAISE NOTICE 'Iniciando seed batch %', v_batch;

    -- =========================================================
    -- USERS
    -- =========================================================
    FOR i IN 1..v_users_count LOOP

        INSERT INTO users (
            email,
            password_hash,
            display_name,
            currency,
            timezone,
            locale,
            theme,
            theme_mode,
            role,
            is_active,
            password_changed_at,
            last_login_at,
            created_at
        )
        VALUES (
            format('seed_%s_user_%s@example.com', v_batch, i),

            -- Hash falso, solamente para datos de prueba.
            '$2b$12$seed.hash.not.for.production.' || lpad(i::text, 6, '0'),

            format('Usuario Seed %s', i),

            CASE floor(random() * 4)::int
                WHEN 0 THEN 'BRL'
                WHEN 1 THEN 'USD'
                WHEN 2 THEN 'EUR'
                ELSE 'ARS'
            END,

            CASE floor(random() * 4)::int
                WHEN 0 THEN 'America/Sao_Paulo'
                WHEN 1 THEN 'America/Argentina/Buenos_Aires'
                WHEN 2 THEN 'Europe/Madrid'
                ELSE 'America/Mexico_City'
            END,

            CASE floor(random() * 3)::int
                WHEN 0 THEN 'es-ES'
                WHEN 1 THEN 'pt-BR'
                ELSE 'en-US'
            END,

            (
                ARRAY[
                    'aurora',
                    'ocean',
                    'royal',
                    'orchid',
                    'rose',
                    'sunset',
                    'forest',
                    'graphite',
                    'coral',
                    'nord',
                    'contrast-light',
                    'contrast-dark'
                ]
            )[1 + floor(random() * 12)::int],

            (ARRAY['system', 'light', 'dark'])
                [1 + floor(random() * 3)::int],

            CASE
                WHEN random() < 0.05 THEN 'admin'
                ELSE 'user'
            END,

            random() > 0.03,

            now() - (random() * interval '700 days'),
            now() - (random() * interval '30 days'),
            now() - (random() * interval '730 days')
        )
        RETURNING id INTO v_user_id;


        -- =====================================================
        -- AUTH SESSIONS
        -- =====================================================
        FOR j IN 1..v_sessions_per_user LOOP

            v_created_at :=
                now() - (random() * interval '60 days');

            INSERT INTO auth_sessions (
                user_id,
                token_hash,
                user_agent,
                ip_address,
                created_at,
                last_seen_at,
                expires_at,
                revoked_at
            )
            VALUES (
                v_user_id,

                -- Dos MD5 concatenados = 64 chars hex = 32 bytes
                decode(
                    md5(v_user_id::text || ':' || j || ':' || random()) ||
                    md5(random()::text || clock_timestamp()::text),
                    'hex'
                ),

                (
                    ARRAY[
                        'Mozilla/5.0 Chrome/140 Windows',
                        'Mozilla/5.0 Safari macOS',
                        'Mozilla/5.0 Firefox Linux',
                        'OhMyCash PWA Android',
                        'OhMyCash PWA iOS'
                    ]
                )[1 + floor(random() * 5)::int],

                format(
                    '%s.%s.%s.%s',
                    10 + floor(random() * 200)::int,
                    floor(random() * 255)::int,
                    floor(random() * 255)::int,
                    1 + floor(random() * 253)::int
                ),

                v_created_at,

                v_created_at + (random() * interval '10 days'),

                v_created_at
                    + interval '90 days'
                    + (random() * interval '90 days'),

                CASE
                    WHEN random() < 0.20
                    THEN v_created_at + interval '15 days'
                    ELSE NULL
                END
            );

        END LOOP;


        -- =====================================================
        -- EXPENSE CATEGORIES
        -- =====================================================
        FOR j IN 1..array_length(v_expense_categories, 1) LOOP

            INSERT INTO categories (
                user_id,
                name,
                kind,
                icon,
                color,
                is_archived
            )
            VALUES (
                v_user_id,
                v_expense_categories[j],
                'expense',
                (
                    ARRAY[
                        'shopping_cart',
                        'restaurant',
                        'directions_car',
                        'home',
                        'lightbulb',
                        'water_drop',
                        'wifi',
                        'phone_iphone',
                        'health_and_safety',
                        'medication',
                        'school',
                        'sports_esports',
                        'flight',
                        'shopping_bag',
                        'home'
                    ]
                )[j],

                (ARRAY['teal', 'emerald', 'cyan', 'blue', 'indigo', 'violet', 'amber', 'rose'])
                    [1 + floor(random() * 8)::int],

                random() < 0.03
            );

        END LOOP;


        -- =====================================================
        -- INCOME CATEGORIES
        -- =====================================================
        FOR j IN 1..array_length(v_income_categories, 1) LOOP

            INSERT INTO categories (
                user_id,
                name,
                kind,
                icon,
                color
            )
            VALUES (
                v_user_id,
                v_income_categories[j],
                'income',
                (
                    ARRAY[
                        'account_balance_wallet',
                        'computer',
                        'savings',
                        'redeem',
                        'storefront'
                    ]
                )[j],

                (ARRAY['teal', 'emerald', 'cyan', 'blue', 'indigo', 'violet', 'amber', 'rose'])
                    [1 + floor(random() * 8)::int]
            );

        END LOOP;


        -- =====================================================
        -- BOTH CATEGORIES
        -- =====================================================
        FOR j IN 1..array_length(v_both_categories, 1) LOOP

            INSERT INTO categories (
                user_id,
                name,
                kind,
                icon,
                color
            )
            VALUES (
                v_user_id,
                v_both_categories[j],
                'both',
                'swap_horiz',
                (ARRAY['teal', 'emerald', 'cyan', 'blue', 'indigo', 'violet', 'amber', 'rose'])
                    [1 + floor(random() * 8)::int]
            );

        END LOOP;


        -- =====================================================
        -- RECURRING RULES
        -- =====================================================
        FOR j IN 1..v_rules_per_user LOOP

            v_direction :=
                CASE
                    WHEN random() < 0.75 THEN 'expense'
                    ELSE 'income'
                END;

            v_amount_mode :=
                CASE
                    WHEN random() < 0.70 THEN 'fixed'
                    ELSE 'variable'
                END;

            -- Buscar una categoría compatible
            SELECT id
            INTO v_category_id
            FROM categories
            WHERE user_id = v_user_id
              AND is_archived = false
              AND (
                    kind = v_direction
                    OR kind = 'both'
                  )
            ORDER BY random()
            LIMIT 1;


            -- -----------------------------------------------
            -- Importes
            -- -----------------------------------------------
            v_amount :=
                (50 + random() * 5000)::numeric(14,2);

            IF v_amount_mode = 'variable' THEN
                v_estimated := v_amount;

                v_min :=
                    greatest(
                        1,
                        v_amount * (0.50 + random() * 0.20)
                    )::numeric(14,2);

                v_max :=
                    (
                        v_amount * (1.20 + random() * 0.80)
                    )::numeric(14,2);
            ELSE
                v_estimated := NULL;
                v_min := NULL;
                v_max := NULL;
            END IF;


            v_day := 1 + floor(random() * 28)::int;


            INSERT INTO recurring_rules (
                user_id,
                category_id,
                name,
                direction,
                amount_mode,

                fixed_amount,
                estimated_amount,
                min_amount,
                max_amount,

                frequency,
                day_of_month,

                starts_on,
                ends_on,

                is_active,
                notes
            )
            VALUES (
                v_user_id,
                v_category_id,

                format(
                    '%s recurrente #%s',
                    CASE
                        WHEN v_direction = 'income'
                        THEN 'Ingreso'
                        ELSE 'Gasto'
                    END,
                    j
                ),

                v_direction,
                v_amount_mode,

                CASE
                    WHEN v_amount_mode = 'fixed'
                    THEN v_amount
                    ELSE NULL
                END,

                v_estimated,
                v_min,
                v_max,

                'monthly',
                v_day,

                (
                    date_trunc(
                        'month',
                        current_date
                            - ((v_recurring_months - 6) || ' months')::interval
                    )
                )::date,

                NULL,

                random() > 0.05,

                format(
                    'Regla generada automáticamente por seed %s',
                    v_batch
                )
            )
            RETURNING id INTO v_rule_id;


            -- =================================================
            -- TRANSACTIONS DE ESTA REGLA
            -- =================================================
            FOR m IN 0..(v_recurring_months - 1) LOOP

                v_period :=
                    (
                        date_trunc(
                            'month',
                            current_date
                                - ((v_recurring_months - 6) || ' months')::interval
                        )
                        + (m || ' months')::interval
                    )::date;

                -- Usamos hasta día 28 para no preocuparnos
                -- por febrero.
                v_due_date :=
                    v_period + (v_day - 1);

                v_rnd := random();


                -- ---------------------------------------------
                -- Estado
                -- ---------------------------------------------
                IF v_due_date > current_date THEN
                    -- Futuro: casi todo pendiente
                    IF v_rnd < 0.90 THEN
                        v_status := 'pending';
                    ELSIF v_rnd < 0.96 THEN
                        v_status := 'cancelled';
                    ELSE
                        v_status := 'skipped';
                    END IF;

                ELSE
                    -- Pasado
                    IF v_rnd < 0.82 THEN
                        v_status := 'paid';
                    ELSIF v_rnd < 0.90 THEN
                        v_status := 'skipped';
                    ELSIF v_rnd < 0.95 THEN
                        v_status := 'cancelled';
                    ELSE
                        v_status := 'pending';
                    END IF;
                END IF;


                -- ---------------------------------------------
                -- Importe esperado
                -- ---------------------------------------------
                IF v_amount_mode = 'fixed' THEN
                    v_amount := (
                        SELECT fixed_amount
                        FROM recurring_rules
                        WHERE id = v_rule_id
                    );
                ELSE
                    v_amount :=
                        (
                            v_min + random() * (v_max - v_min)
                        )::numeric(14,2);
                END IF;


                -- ---------------------------------------------
                -- Campos específicos para PAID
                -- ---------------------------------------------
                IF v_status = 'paid' THEN

                    v_actual_amount :=
                        greatest(
                            0.01,
                            v_amount * (0.90 + random() * 0.20)
                        )::numeric(14,2);

                    v_occurred_at :=
                        v_due_date::timestamp
                        + (
                            (floor(random() * 24)::int)
                            || ' hours'
                          )::interval;

                ELSE
                    v_actual_amount := NULL;
                    v_occurred_at := NULL;
                END IF;


                INSERT INTO transactions (
                    user_id,
                    category_id,
                    recurring_rule_id,
                    client_operation_id,

                    direction,
                    status,

                    description,
                    notes,

                    expected_amount,
                    actual_amount,

                    due_date,
                    recurrence_period,

                    occurred_at,
                    paid_at,

                    created_at
                )
                VALUES (
                    v_user_id,
                    v_category_id,
                    v_rule_id,

                    CASE
                        WHEN random() < 0.85 THEN uuidv7()
                        ELSE NULL
                    END,

                    v_direction,
                    v_status,

                    format(
                        'Movimiento recurrente %s - %s',
                        j,
                        to_char(v_period, 'YYYY-MM')
                    ),

                    CASE
                        WHEN random() < 0.25
                        THEN 'Nota automática generada por el seed'
                        ELSE NULL
                    END,

                    v_amount,
                    v_actual_amount,

                    v_due_date,
                    v_period,

                    v_occurred_at,

                    CASE
                        WHEN v_status = 'paid'
                        THEN
                            v_occurred_at
                            + (random() * interval '8 hours')
                        ELSE NULL
                    END,

                    least(
                        now(),
                        v_period::timestamp
                            + (random() * interval '5 days')
                    )
                );

            END LOOP;

        END LOOP;


        -- =====================================================
        -- TRANSACTIONS NO RECURRENTES
        -- =====================================================
        FOR j IN 1..v_transactions_per_user LOOP

            v_direction :=
                CASE
                    WHEN random() < 0.78 THEN 'expense'
                    ELSE 'income'
                END;


            -- Categoría compatible con la dirección
            SELECT id
            INTO v_category_id
            FROM categories
            WHERE user_id = v_user_id
              AND is_archived = false
              AND (
                    kind = v_direction
                    OR kind = 'both'
                  )
            ORDER BY random()
            LIMIT 1;


            -- Distribución temporal:
            -- últimos ~2 años y hasta 60 días hacia adelante.
            v_due_date :=
                current_date
                - floor(random() * 730)::int
                + floor(random() * 60)::int;


            v_amount :=
                CASE
                    WHEN v_direction = 'expense'
                    THEN (5 + random() * 3000)::numeric(14,2)
                    ELSE (100 + random() * 12000)::numeric(14,2)
                END;


            v_rnd := random();


            -- -----------------------------------------------
            -- Status
            --
            -- "skipped" NO se usa aquí porque el esquema
            -- exige recurring_rule_id para skipped.
            -- -----------------------------------------------
            IF v_due_date > current_date THEN

                IF v_rnd < 0.92 THEN
                    v_status := 'pending';
                ELSE
                    v_status := 'cancelled';
                END IF;

            ELSE

                IF v_rnd < 0.86 THEN
                    v_status := 'paid';
                ELSIF v_rnd < 0.94 THEN
                    v_status := 'pending';
                ELSE
                    v_status := 'cancelled';
                END IF;

            END IF;


            IF v_status = 'paid' THEN

                v_actual_amount :=
                    greatest(
                        0.01,
                        v_amount * (0.85 + random() * 0.30)
                    )::numeric(14,2);

                v_occurred_at :=
                    v_due_date::timestamp
                    + (
                        floor(random() * 24)::int
                        || ' hours'
                      )::interval;

            ELSE
                v_actual_amount := NULL;
                v_occurred_at := NULL;
            END IF;


            INSERT INTO transactions (
                user_id,
                category_id,
                recurring_rule_id,
                client_operation_id,

                direction,
                status,

                description,
                notes,

                expected_amount,
                actual_amount,

                due_date,
                recurrence_period,

                occurred_at,
                paid_at,

                created_at
            )
            VALUES (
                v_user_id,
                v_category_id,
                NULL,

                CASE
                    WHEN random() < 0.80 THEN uuidv7()
                    ELSE NULL
                END,

                v_direction,
                v_status,

                (
                    CASE
                        WHEN v_direction = 'expense' THEN
                            (
                                ARRAY[
                                    'Compra supermercado',
                                    'Cena restaurante',
                                    'Compra online',
                                    'Taxi / transporte',
                                    'Factura mensual',
                                    'Compra farmacia',
                                    'Suscripción',
                                    'Ocio',
                                    'Compra para el hogar',
                                    'Pago de servicio'
                                ]
                            )[1 + floor(random() * 10)::int]
                        ELSE
                            (
                                ARRAY[
                                    'Ingreso recibido',
                                    'Trabajo freelance',
                                    'Pago de cliente',
                                    'Bonificación',
                                    'Venta',
                                    'Ingreso extraordinario'
                                ]
                            )[1 + floor(random() * 6)::int]
                    END
                ),

                CASE
                    WHEN random() < 0.15
                    THEN format(
                        'Transacción seed #%s / batch %s',
                        j,
                        v_batch
                    )
                    ELSE NULL
                END,

                v_amount,
                v_actual_amount,

                v_due_date,
                NULL,

                v_occurred_at,

                CASE
                    WHEN v_status = 'paid'
                    THEN
                        v_occurred_at
                        + (random() * interval '6 hours')
                    ELSE NULL
                END,

                least(
                    now(),
                    v_due_date::timestamp
                        - (random() * interval '15 days')
                )
            );

        END LOOP;


        IF i % 10 = 0 THEN
            RAISE NOTICE 'Usuarios creados: % / %', i, v_users_count;
        END IF;

    END LOOP;


    RAISE NOTICE '=========================================';
    RAISE NOTICE 'Seed completado. Batch: %', v_batch;
    RAISE NOTICE 'Usuarios: %', v_users_count;
    RAISE NOTICE '=========================================';

END
$$;
