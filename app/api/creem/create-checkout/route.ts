import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const CREEM_API_URL = process.env.CREEM_API_BASE_URL || 'https://test-api.creem.io'
const CREEM_API_KEY = process.env.CREEM_API_KEY
const CREEM_PRODUCT_ID = process.env.CREEM_PRODUCT_ID

if (!CREEM_API_KEY || !CREEM_PRODUCT_ID) {
  throw new Error('Missing Creem environment variables')
}

export async function POST(request: NextRequest) {
  try {
    // 获取用户信息
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: '用户未登录' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { successUrl, cancelUrl } = body

    if (!successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: '缺少必需的回调URL' },
        { status: 400 }
      )
    }

    // 创建 Creem checkout session
    const checkoutData = {
      product_id: CREEM_PRODUCT_ID,
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: user.email,
      metadata: {
        user_id: user.id,
        user_email: user.email,
        domain: request.headers.get('origin')
      }
    }

    console.log('创建 Creem checkout session:', checkoutData)

    const response = await fetch(`${CREEM_API_URL}/checkout/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CREEM_API_KEY}`,
      },
      body: JSON.stringify(checkoutData),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Creem API error:', errorData)
      return NextResponse.json(
        { error: '创建支付会话失败', details: errorData },
        { status: response.status }
      )
    }

    const session = await response.json()
    console.log('Creem session created:', session)

    // 在数据库中记录支付尝试（如果表已创建）
    try {
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: user.id,
          creem_checkout_session_id: session.id,
          amount: session.amount || 4.50, // 默认价格
          currency: session.currency || 'USD',
          status: 'pending',
          metadata: {
            creem_session_id: session.id,
            product_id: CREEM_PRODUCT_ID,
            user_email: user.email
          }
        })

      if (paymentError) {
        console.error('记录支付失败:', paymentError)
        // 不阻断流程，继续返回 session URL
      }
    } catch (dbError) {
      console.error('数据库操作失败:', dbError)
      // 表可能还不存在，但不应该阻断支付流程
    }

    return NextResponse.json({
      success: true,
      checkout_url: session.url || session.checkout_url,
      session_id: session.id
    })

  } catch (error) {
    console.error('Create checkout error:', error)
    return NextResponse.json(
      { error: '内部服务器错误' },
      { status: 500 }
    )
  }
}