from ast import expr
from pyteal import *


router = Router(
    "rps",
    BareCallActions(
        no_op=OnCompleteAction.create_only(Approve()),
        opt_in = OnCompleteAction.call_only(Approve()),
        close_out = OnCompleteAction.always(Approve()), 
        update_application = OnCompleteAction.never(),
        delete_application = OnCompleteAction.never(),
    ),
    clear_state=Approve(),
    )

player1 = Bytes('player1')
player2 = Bytes('player2')
wager = Bytes("wager")
local_play = Bytes('localplay')
round = Bytes('round')
p1wins = Bytes('player1wins')
p2wins = Bytes('player2wins')
Draws = Bytes('Draw')

@Subroutine(TealType.none)
def reset_round(account1 : Expr, account2 : Expr):
    return Seq(App.localPut(account1 ,local_play , Bytes("")),
                App.localPut(account1 , local_play , Bytes("")),
                App.localPut(account2 ,local_play , Bytes("")),
                App.localPut(account2 , local_play , Bytes("")),
                App.globalPut(round , App.globalGet(round ) - Int(1)),
    )

@Subroutine(TealType.none)
def reset_all(account1 : Expr, account2 : Expr):
    return Seq(App.localPut(account1 , local_play , Bytes("")),
                App.localPut(account1 , local_play , Bytes("")),
                App.localPut(account2 , local_play , Bytes("")),
                App.localPut(account2 , local_play , Bytes("")),
                App.globalPut(round , Int(0)),
                App.globalPut(wager , Int(0)),
                App.globalPut(p1wins, Int(0)),
                App.globalPut(p2wins, Int(0)),
                App.globalPut(Draws, Int(0)),
                App.globalPut(player1, Bytes("")),
                App.globalPut(player2, Bytes("")),
                )
@Subroutine(TealType.uint64)
def is_empty(account : Expr):
    return Return(
            And(
                App.localGet(account, local_play) == Bytes(""),
                App.globalGet(player1) == Bytes(""),
                App.globalGet(player2) == Bytes(""),
            )
        )


@router.method
def create_challenge(payment: abi.PaymentTransaction):
    return Seq(
        Assert(
            And(
                payment.get().type_enum() == TxnType.Payment,
                payment.get().receiver() == Global.current_application_address(),
                payment.get().close_remainder_to() == Global.zero_address(),


                App.optedIn(payment.get().sender(), Global.current_application_id()), # checking if opponent has opted into the app
                #is_empty(Txn.sender()),
                )),

                App.globalPut(player1 , payment.get().sender()),
                App.globalPut(wager , payment.get().amount()),
                App.globalPut(round , Int(3)),
                App.globalPut(p1wins, Int(0)),
                App.globalPut(p2wins, Int(0)),
                App.globalPut(Draws, Int(0)),
                Approve(),
            
        )

@router.method
def accept_challenge(payment: abi.PaymentTransaction):
    return Seq(
        Assert(
            And(
               payment.get().type_enum() == TxnType.Payment,
                payment.get().receiver() == Global.current_application_address(),
                payment.get().close_remainder_to() == Global.zero_address(),
                App.optedIn(payment.get().sender(), Global.current_application_id()),
                App.globalGet(wager) == payment.get().amount(),
                
            )),
            App.globalPut(player2 , payment.get().sender()),
            App.globalPut(round, Int(3)),
            App.globalPut(p1wins, Int(0)),
            App.globalPut(p2wins, Int(0)),
            App.globalPut(Draws, Int(0)),
            Approve()
        )


@router.method
def play(play : abi.String, *, output:abi.Address):
    return Seq(
        Assert(
            And(
                App.optedIn(Txn.sender(), Global.current_application_id()),)
                #is_play_valid(Txn.application_args[1]))
                ),
                If(Txn.sender() ==  App.globalGet(player1))
                .Then(
                    Seq(App.localPut(Txn.sender() , local_play , play.get()),
                    output.set(App.globalGet(Bytes("player2")))
                    )

                    
                )
                .ElseIf((Txn.sender() ==  App.globalGet(player2)))
                .Then(
                    Seq(App.localPut(Txn.sender() , local_play , play.get()),
                    output.set(App.globalGet(Bytes("player1")))
                    ))
                ,
                output.set(App.globalGet(Bytes("player1"))),
                Approve(),
            )   
@router.method
def getplayer1(*, output:abi.Address):
    return output.set(App.globalGet(Bytes("player1")))

@router.method
def getplayer2(*, output:abi.Address):
    return output.set(App.globalGet(Bytes("player2")))

@Subroutine(TealType.uint64)
def play_value(move : Expr):

    return Seq(
        Return(
            Cond(
                [Base64Decode.std(move) == Bytes("r"), Int(0)],
                [Base64Decode.std(move) == Bytes("p"), Int(1)],
                [Base64Decode.std(move) == Bytes("s"), Int(2)],
            )
        ),
    ) 

@Subroutine(TealType.none)
def winner(p1move: Expr , p2move: Expr):
    return Seq(
        Cond(
        [p1move == p2move, App.globalPut(Draws, App.globalGet(Draws) + Int(1))],
        [(p1move + Int(1)) % Int(3) == p2move, App.globalPut(p2wins, App.globalGet(p2wins) + Int(1))],
        [(p2move + Int(1)) % Int(3) == p1move, App.globalPut(p1wins, App.globalGet(p1wins) + Int(1))],
        ),
    )

@Subroutine(TealType.uint64)
def round_winner(p1move: Expr , p2move: Expr):
    return Seq(
        Cond(
        [p1move == p2move, Int(0)],
        [(p1move + Int(1)) % Int(3) == p2move,Int(2)],
        [(p2move + Int(1)) % Int(3) == p1move, Int(1)],
        ),
    )


@Subroutine(TealType.none)
def send_rewards(account : Expr , amount: Expr):
    return Seq(
        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetFields(
            { TxnField.type_enum : TxnType.Payment,
                TxnField.receiver : account,
                TxnField.amount : amount
            }
        ),
        InnerTxnBuilder.Submit()
    )
@router.method
def rw(account1 :abi.Account, account2: abi.Account, *,output : abi.Uint64):
    return  output.set(round_winner(play_value(App.localGet(account1.address(), local_play)), play_value(App.localGet(account2.address(), local_play))))


@router.method
def reveal(account1 :abi.Account, account2: abi.Account):
    return Seq(
        If(Txn.sender() == App.globalGet(player1))
        .Then(
        Seq(
            winner(play_value(App.localGet(account1.address(), local_play)), play_value(App.localGet(account2.address(), local_play))),
            If(Or(And(App.globalGet(Draws) >= Int(2), App.globalGet(round) == Int(1)), 
            And(App.globalGet(Draws) == Int(1), App.globalGet(round) == Int(1), App.globalGet(p1wins) == Int(1), App.globalGet(p2wins) == Int(1))))
            .Then(
                Seq(
                send_rewards(account1.address(), App.globalGet(wager) - (App.globalGet(wager)*Int(12)/Int(100))),
                send_rewards(account2.address(), App.globalGet(wager) - (App.globalGet(wager)*Int(12)/Int(100))),
                
                reset_all(account1.address(), account2.address()),
                )
            )
            .ElseIf(And(App.globalGet(p1wins) >= Int(2), App.globalGet(round) == Int(1)))
            .Then(
                Seq(
                send_rewards(account1.address(), (App.globalGet(wager) *Int(2)) - ((App.globalGet(wager) *Int(2))*Int(12)/Int(100))),
                reset_all(account1.address(), account2.address()),
                )
            )
            .ElseIf(And(App.globalGet(p2wins) >= Int(2), App.globalGet(round) == Int(1)))
            .Then(
                Seq(
                send_rewards(account2.address(), (App.globalGet(wager) *Int(2)) - ((App.globalGet(wager) *Int(2))*Int(12)/Int(100))),
                reset_all(account1.address(),account2.address()),
                )
            )
            .Else(
            
                reset_round(account1.address(),account2.address()),
            )
        ),
        ),
        
        Approve(),
        
    )

if __name__ == "__main__":
    import os
    import json

    path = os.path.dirname(os.path.abspath(__file__))
    approvals, clears, contract = router.compile_program(version=8)
    print(path)


    # Dump out the contract as json that can be read in by any of the SDKs
    with open(os.path.join(path, "./build/contract.json"), "w") as f:
        f.write(json.dumps(contract.dictify(), indent=2))

    # Write out the approval and clear programs
    with open(os.path.join(path, "./build/approval.teal"), "w") as f:
        f.write(approvals)

    with open(os.path.join(path, "./build/clear.teal"), "w") as f:
        f.write(clears)
